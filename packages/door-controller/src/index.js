/**
 * LocQar Door Controller Service
 * ================================
 * Local HTTP server that bridges the terminal-app to the RS-485 lock control boards.
 * Runs on the locker's embedded board alongside the kiosk touchscreen app.
 *
 * Endpoints:
 *   POST /door/open    — Open a specific door
 *   GET  /door/status  — Check door open/closed state
 *   GET  /health       — Service health check
 *
 * Environment variables:
 *   SERIAL_PORT     — Serial device path (default: /dev/ttyS0)
 *   SERIAL_BAUD     — Baud rate (default: 9600)
 *   HTTP_PORT       — HTTP listen port (default: 9090)
 *   SIMULATE        — Set to "true" for development without hardware
 *   API_KEY         — Optional shared secret for local auth
 */

const express = require('express');
const { SerialManager } = require('./serial');
const { mapDoorToStation } = require('./protocol');

// ── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  serialPort: process.env.SERIAL_PORT || '/dev/ttyS0',
  baudRate: parseInt(process.env.SERIAL_BAUD || '9600', 10),
  httpPort: parseInt(process.env.HTTP_PORT || '9090', 10),
  simulate: process.env.SIMULATE === 'true',
  apiKey: process.env.API_KEY || '',
};

// ── Logger ───────────────────────────────────────────────────────────────────

const logger = {
  info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
  warn: (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args),
};

// ── Serial Manager ───────────────────────────────────────────────────────────

const serial = new SerialManager({
  path: CONFIG.serialPort,
  baudRate: CONFIG.baudRate,
  simulate: CONFIG.simulate,
  logger,
});

// ── Express App ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// CORS — allow local terminal-app to call us
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Optional API key auth
if (CONFIG.apiKey) {
  app.use((req, res, next) => {
    if (req.path === '/health') return next(); // health is public
    const key = req.headers['x-api-key'];
    if (key !== CONFIG.apiKey) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /door/open
 * Body: { "door": 5 }                    — global door number (auto-maps to station/lock)
 *   or: { "station": 1, "lock": 5 }      — explicit station + lock
 */
app.post('/door/open', async (req, res) => {
  try {
    let { door, station, lock } = req.body;

    // If global door number provided, map to station/lock
    if (door !== undefined) {
      const mapped = mapDoorToStation(Number(door));
      station = mapped.station;
      lock = mapped.lock;
    }

    if (station === undefined || lock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Provide either "door" (global number) or "station" + "lock"',
      });
    }

    station = Number(station);
    lock = Number(lock);

    const result = await serial.openLock(station, lock);

    res.json({
      success: result.success,
      station: result.station,
      lock: result.lock,
      door: (result.station - 1) * 16 + result.lock,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('[/door/open] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /door/status?station=1
 * GET /door/status?station=1&locks=1,2,5
 * GET /door/status?door=5         — single door by global number
 */
app.get('/door/status', async (req, res) => {
  try {
    let { station, locks, door } = req.query;

    // Single door query
    if (door !== undefined) {
      const mapped = mapDoorToStation(Number(door));
      station = mapped.station;
      locks = String(mapped.lock);
    }

    if (station === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Provide "station" or "door" query parameter',
      });
    }

    const stationNum = Number(station);
    const lockNums = locks ? locks.split(',').map(Number) : [];

    const result = await serial.checkStatus(stationNum, lockNums);

    // If single door was queried, return simplified response
    if (door !== undefined) {
      const mapped = mapDoorToStation(Number(door));
      const doorStatus = result.doors[mapped.lock];
      return res.json({
        success: !result.error,
        door: Number(door),
        status: doorStatus,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    // Full station response
    res.json({
      success: !result.error,
      station: result.station,
      doors: result.doors,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('[/door/status] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    service: '@locqar/door-controller',
    version: '1.0.0',
    serial: {
      port: CONFIG.serialPort,
      baudRate: CONFIG.baudRate,
      connected: serial.connected,
      simulate: CONFIG.simulate,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Start ────────────────────────────────────────────────────────────────────

async function main() {
  logger.info('┌─────────────────────────────────────────┐');
  logger.info('│  LocQar Door Controller Service v1.0.0  │');
  logger.info('└─────────────────────────────────────────┘');
  logger.info(`Serial:    ${CONFIG.serialPort} @ ${CONFIG.baudRate} baud`);
  logger.info(`HTTP:      http://localhost:${CONFIG.httpPort}`);
  logger.info(`Simulate:  ${CONFIG.simulate}`);
  logger.info(`Auth:      ${CONFIG.apiKey ? 'enabled' : 'disabled'}`);

  await serial.connect();

  app.listen(CONFIG.httpPort, '127.0.0.1', () => {
    logger.info(`[HTTP] Listening on http://127.0.0.1:${CONFIG.httpPort}`);
    logger.info('[Ready] Door controller is operational');
  });
}

main().catch((err) => {
  logger.error('Fatal:', err);
  process.exit(1);
});
