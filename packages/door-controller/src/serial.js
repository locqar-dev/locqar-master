/**
 * Serial port manager for RS-485 communication with Winnsen lock control boards.
 *
 * Handles connection lifecycle, command queuing, and response parsing.
 * Supports automatic reconnection and a simulation mode for development.
 */

const { buildOpenLockCommand, parseOpenLockResponse, buildCheckStatusCommand, parseCheckStatusResponse } = require('./protocol');

const RESPONSE_TIMEOUT_MS = 3000;
const RECONNECT_DELAY_MS = 5000;
const COMMAND_QUEUE_INTERVAL_MS = 100; // gap between queued commands

class SerialManager {
  /**
   * @param {object} opts
   * @param {string} opts.path - Serial port path (e.g. '/dev/ttyS0', '/dev/ttyUSB0')
   * @param {number} [opts.baudRate=9600]
   * @param {boolean} [opts.simulate=false] - If true, skip real serial and simulate responses
   * @param {function} [opts.logger=console] - Logger with .info/.warn/.error methods
   */
  constructor({ path, baudRate = 9600, simulate = false, logger = console }) {
    this.path = path;
    this.baudRate = baudRate;
    this.simulate = simulate;
    this.log = logger;
    this.port = null;
    this.parser = null;
    this.connected = false;
    this.queue = [];
    this.processing = false;
    this.responseBuffer = Buffer.alloc(0);
    this._pendingResolve = null;
    this._pendingTimeout = null;
  }

  /**
   * Connect to the serial port. No-op in simulate mode.
   */
  async connect() {
    if (this.simulate) {
      this.log.info('[Serial] Running in SIMULATE mode — no real hardware');
      this.connected = true;
      return;
    }

    try {
      // Dynamic import so the module doesn't crash if serialport isn't installed (e.g. in CI)
      const { SerialPort } = require('serialport');

      this.port = new SerialPort({
        path: this.path,
        baudRate: this.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false,
      });

      await new Promise((resolve, reject) => {
        this.port.open((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.connected = true;
      this.log.info(`[Serial] Connected to ${this.path} @ ${this.baudRate} baud`);

      // Accumulate incoming data
      this.port.on('data', (chunk) => {
        this.responseBuffer = Buffer.concat([this.responseBuffer, chunk]);
        this._tryResolve();
      });

      this.port.on('close', () => {
        this.log.warn('[Serial] Port closed');
        this.connected = false;
        this._scheduleReconnect();
      });

      this.port.on('error', (err) => {
        this.log.error('[Serial] Port error:', err.message);
        this.connected = false;
        this._scheduleReconnect();
      });
    } catch (err) {
      this.log.error(`[Serial] Failed to connect to ${this.path}:`, err.message);
      this._scheduleReconnect();
    }
  }

  /**
   * Disconnect from the serial port.
   */
  async disconnect() {
    if (this.port && this.port.isOpen) {
      await new Promise((resolve) => this.port.close(resolve));
    }
    this.connected = false;
    this.log.info('[Serial] Disconnected');
  }

  /**
   * Send a raw command and wait for a response of expected length.
   * @param {Buffer} command - The command frame bytes
   * @param {number} expectedLen - Expected response length in bytes
   * @returns {Promise<Buffer>}
   */
  async _sendRaw(command, expectedLen) {
    if (this.simulate) {
      return this._simulateResponse(command);
    }

    if (!this.connected || !this.port?.isOpen) {
      throw new Error('Serial port not connected');
    }

    return new Promise((resolve, reject) => {
      this.responseBuffer = Buffer.alloc(0);

      this._pendingResolve = { resolve, expectedLen };
      this._pendingTimeout = setTimeout(() => {
        this._pendingResolve = null;
        reject(new Error(`Response timeout after ${RESPONSE_TIMEOUT_MS}ms`));
      }, RESPONSE_TIMEOUT_MS);

      this.port.write(command, (err) => {
        if (err) {
          clearTimeout(this._pendingTimeout);
          this._pendingResolve = null;
          reject(err);
        }
      });
    });
  }

  /**
   * Check if accumulated buffer has enough data to resolve the pending promise.
   */
  _tryResolve() {
    if (!this._pendingResolve) return;
    const { resolve, expectedLen } = this._pendingResolve;

    if (this.responseBuffer.length >= expectedLen) {
      clearTimeout(this._pendingTimeout);
      this._pendingResolve = null;
      resolve(Buffer.from(this.responseBuffer.subarray(0, expectedLen)));
      this.responseBuffer = this.responseBuffer.subarray(expectedLen);
    }
  }

  /**
   * Simulate a response for development/testing.
   */
  _simulateResponse(command) {
    const fc = command[2];

    if (fc === 0x05) {
      // Open Lock → simulate success
      const station = command[3];
      const lock = command[4];
      this.log.info(`[Serial/SIM] Open door: station=${station} lock=${lock} → SUCCESS`);
      return Buffer.from([0x90, 0x07, 0x85, station, lock, 0x01, 0x03]);
    }

    if (fc === 0x02) {
      // Check Status → simulate all closed
      const station = command[3];
      this.log.info(`[Serial/SIM] Check status: station=${station} → all closed`);
      return Buffer.from([0x90, 0x07, 0x82, station, 0x00, 0x00, 0x03]);
    }

    return Buffer.alloc(0);
  }

  /**
   * Schedule a reconnection attempt.
   */
  _scheduleReconnect() {
    this.log.info(`[Serial] Reconnecting in ${RECONNECT_DELAY_MS}ms...`);
    setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Open a specific lock.
   * @param {number} station - Control board station number
   * @param {number} lock - Lock number (1–16)
   * @returns {Promise<{ success: boolean, station: number, lock: number, error: string|null }>}
   */
  async openLock(station, lock) {
    const cmd = buildOpenLockCommand(station, lock);
    this.log.info(`[Serial] Opening lock: station=${station} lock=${lock} cmd=${cmd.toString('hex')}`);

    const resp = await this._sendRaw(cmd, 7);
    const parsed = parseOpenLockResponse(resp);

    this.log.info(`[Serial] Open result: station=${parsed.station} lock=${parsed.lock} success=${parsed.success}`);
    return parsed;
  }

  /**
   * Check status of locks on a station.
   * @param {number} station - Control board station number
   * @param {number[]} [locks=[]] - Lock numbers to check (empty = all 16)
   * @returns {Promise<{ station: number, doors: Record<number, 'open'|'closed'>, error: string|null }>}
   */
  async checkStatus(station, locks = []) {
    const cmd = buildCheckStatusCommand(station, locks);
    this.log.info(`[Serial] Checking status: station=${station} locks=${locks.length ? locks.join(',') : 'all'}`);

    const resp = await this._sendRaw(cmd, 7);
    const parsed = parseCheckStatusResponse(resp);

    this.log.info(`[Serial] Status result: station=${parsed.station}`, parsed.doors);
    return parsed;
  }
}

module.exports = { SerialManager };
