/**
 * Winnsen Lock Control Board Serial Protocol
 * ============================================
 * Reference: Lock Control Board Serial Command Document V202104
 *
 * Connection: RS-485 bus, 9600 baud, 8N1
 * Each control board handles up to 16 locks.
 * Board identified by station number (DIP switch on hardware).
 *
 * Frame format:
 *   [0x90] [Length] [FunctionCode] [Payload...] [0x03]
 *
 * Function codes (send):
 *   0x05 — Open Lock
 *   0x02 — Check Lock Status
 *
 * Function codes (response):
 *   Some boards use 0x80 offset (documented): 0x85 (open), 0x82 (status)
 *   Some boards use 0xA0 offset (alternate):  0xA5 (open), 0xA2 (status)
 *   Both variants are accepted by the parsers below.
 */

const FRAME_HEADER = 0x90;
const FRAME_END = 0x03;

// Function codes — send
const FC_OPEN_LOCK_SEND = 0x05;
const FC_CHECK_STATUS_SEND = 0x02;

// Function codes — response (documented 0x80 offset)
const FC_OPEN_LOCK_RECV = 0x85;
const FC_CHECK_STATUS_RECV = 0x82;

// Function codes — response (alternate 0xA0 offset, confirmed on some boards)
const FC_OPEN_LOCK_RECV_ALT = 0xA5;
const FC_CHECK_STATUS_RECV_ALT = 0xA2;

/**
 * Build an Open Lock command frame
 * @param {number} station - Station number (DIP switch on control board, 0x00–0xFF)
 * @param {number} lock - Lock number on that board (1–16, sent as 0x01–0x10)
 * @returns {Buffer} 6-byte frame: [90 06 05 SS LL 03]
 */
function buildOpenLockCommand(station, lock) {
  if (station < 0 || station > 255) throw new Error(`Invalid station: ${station}`);
  if (lock < 1 || lock > 16) throw new Error(`Invalid lock number: ${lock} (must be 1-16)`);

  return Buffer.from([
    FRAME_HEADER,
    0x06,               // length
    FC_OPEN_LOCK_SEND,  // function code
    station & 0xFF,     // station number
    lock & 0xFF,        // lock number
    FRAME_END,
  ]);
}

/**
 * Parse an Open Lock response frame
 * @param {Buffer} data - 7-byte frame: [90 07 85 SS LL ST 03]
 * @returns {{ station: number, lock: number, success: boolean }}
 */
function parseOpenLockResponse(data) {
  if (!data || data.length < 7) {
    return { station: 0, lock: 0, success: false, error: 'Incomplete response' };
  }
  if (data[0] !== FRAME_HEADER || data[6] !== FRAME_END) {
    return { station: 0, lock: 0, success: false, error: 'Invalid frame' };
  }
  // Accept both 0x85 (documented) and 0xA5 (alternate board variant)
  if (data[2] !== FC_OPEN_LOCK_RECV && data[2] !== FC_OPEN_LOCK_RECV_ALT) {
    return { station: 0, lock: 0, success: false, error: 'Invalid frame' };
  }

  return {
    station: data[3],
    lock: data[4],
    success: data[5] === 0x01,  // 0x01 = opened, 0x00 = failed
    error: data[5] === 0x01 ? null : 'Door failed to open (status 0x00)',
  };
}

/**
 * Build a Check Lock Status command frame
 * @param {number} station - Station number
 * @param {number[]} locks - Array of lock numbers to check (1–16)
 * @returns {Buffer} 7-byte frame: [90 07 02 SS LL HH 03]
 */
function buildCheckStatusCommand(station, locks = []) {
  if (station < 0 || station > 255) throw new Error(`Invalid station: ${station}`);

  // Build 16-bit bitmask: bit N-1 = lock N
  let mask = 0;
  if (locks.length === 0) {
    // Check all 16
    mask = 0xFFFF;
  } else {
    for (const l of locks) {
      if (l < 1 || l > 16) throw new Error(`Invalid lock number: ${l}`);
      mask |= (1 << (l - 1));
    }
  }

  const lowByte = mask & 0xFF;
  const highByte = (mask >> 8) & 0xFF;

  return Buffer.from([
    FRAME_HEADER,
    0x07,                   // length
    FC_CHECK_STATUS_SEND,   // function code
    station & 0xFF,         // station number
    lowByte,                // low bit mask
    highByte,               // high bit mask
    FRAME_END,
  ]);
}

/**
 * Parse a Check Lock Status response frame
 * @param {Buffer} data - 7-byte frame: [90 07 82 SS LL HH 03]
 * @returns {{ station: number, doors: Record<number, 'open'|'closed'> }}
 */
function parseCheckStatusResponse(data) {
  if (!data || data.length < 7) {
    return { station: 0, doors: {}, error: 'Incomplete response' };
  }
  if (data[0] !== FRAME_HEADER || data[6] !== FRAME_END) {
    return { station: 0, doors: {}, error: 'Invalid frame' };
  }
  // Accept both 0x82 (documented) and 0xA2 (alternate board variant)
  if (data[2] !== FC_CHECK_STATUS_RECV && data[2] !== FC_CHECK_STATUS_RECV_ALT) {
    return { station: 0, doors: {}, error: 'Invalid frame' };
  }

  const station = data[3];
  const mask = data[4] | (data[5] << 8);
  const doors = {};

  for (let i = 0; i < 16; i++) {
    doors[i + 1] = (mask & (1 << i)) ? 'open' : 'closed';
  }

  return { station, doors, error: null };
}

/**
 * Map a global door number to (station, lock) pair.
 *
 * Station offset is configurable via STATION_OFFSET env var.
 * Default offset = 0: station 1 = doors 1-16, station 2 = doors 17-32
 * Offset = 1:         station 2 = doors 1-16, station 3 = doors 17-32
 *
 * Use offset when your first board's DIP switch isn't set to station 1.
 * For example, if the first board is station 2, set STATION_OFFSET=1.
 *
 * @param {number} doorNumber - Global door number (1-based)
 * @param {number} [stationOffset] - Override for STATION_OFFSET env var
 * @returns {{ station: number, lock: number }}
 */
function mapDoorToStation(doorNumber, stationOffset) {
  if (doorNumber < 1) throw new Error(`Invalid door number: ${doorNumber}`);
  const offset = stationOffset ?? parseInt(process.env.STATION_OFFSET || '0', 10);
  const station = Math.ceil(doorNumber / 16) + offset;
  const lock = ((doorNumber - 1) % 16) + 1;
  return { station, lock };
}

module.exports = {
  FRAME_HEADER,
  FRAME_END,
  FC_OPEN_LOCK_SEND,
  FC_OPEN_LOCK_RECV,
  FC_OPEN_LOCK_RECV_ALT,
  FC_CHECK_STATUS_SEND,
  FC_CHECK_STATUS_RECV,
  FC_CHECK_STATUS_RECV_ALT,
  buildOpenLockCommand,
  parseOpenLockResponse,
  buildCheckStatusCommand,
  parseCheckStatusResponse,
  mapDoorToStation,
};
