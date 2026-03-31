/**
 * Locker Command Queue — In-house door control (replaces Winnsen cloud)
 *
 * Mounted at /api/locker (no v1 prefix, like winnsen)
 * Auth: x-api-key header (same key the winnsen router uses)
 *
 * Flow:
 *   1. Test page / admin / partner → POST /api/locker/open-door
 *   2. Kiosk app polls              → GET  /api/locker/commands?lockerSN=X
 *   3. Kiosk opens door via RS-485  → POST /api/locker/commands/:id/ack
 *   4. Test page polls status       → GET  /api/locker/commands/:id
 */

import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import { prisma } from '../../config/database';
import { logger } from '../../shared/utils/logger';

const router = Router();

// ── Types ────────────────────────────────────────────────────────────────────

interface LockerCommand {
  id: string;
  type: 'open-door';
  lockerSN: string;
  doorNum: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

// ── In-memory command queue ──────────────────────────────────────────────────
// For single-instance dev. Swap to Redis for production clustering:
//   key = `locker:commands:${lockerSN}`, value = JSON list

const commands = new Map<string, LockerCommand>();
const TTL_SECONDS = 120;

// Cleanup expired commands every 60s
setInterval(() => {
  const now = Date.now();
  for (const [id, cmd] of commands) {
    if (now - cmd.createdAt.getTime() > TTL_SECONDS * 2 * 1000) {
      commands.delete(id);
    }
  }
}, 60_000);

function generateId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ── Auth: same x-api-key as winnsen inbound ──────────────────────────────────

const LOCKER_API_KEY = process.env.LOCKER_API_KEY || config.winnsen.inboundApiKey;

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'] as string | undefined;
  if (!key || key !== LOCKER_API_KEY) {
    res.status(401).json({ success: false, message: 'Invalid API key' });
    return;
  }
  next();
}

router.use(requireApiKey);

// ── POST /api/locker/open-door ───────────────────────────────────────────────
// Queue a door-open command. Called by test page, admin, or any authorized client.

router.post('/open-door', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lockerSN, doorNum } = req.body;

    if (!lockerSN || !doorNum) {
      return res.status(400).json({ success: false, message: 'lockerSN and doorNum required' });
    }

    // Validate locker exists
    const locker = await prisma.locker.findFirst({
      where: { terminal: { code: lockerSN } },
      include: { terminal: { select: { id: true, name: true, code: true, isActive: true } } },
    });

    if (!locker?.terminal) {
      // Also try by winnsenSn for backward compat
      const byWinnsen = await prisma.locker.findFirst({
        where: { winnsenSn: lockerSN },
        include: { terminal: { select: { id: true, name: true, code: true, isActive: true } } },
      });
      if (!byWinnsen?.terminal) {
        return res.status(404).json({ success: false, message: `Locker terminal not found: ${lockerSN}` });
      }
    }

    const id = generateId();
    const command: LockerCommand = {
      id,
      type: 'open-door',
      lockerSN,
      doorNum: Number(doorNum),
      status: 'pending',
      createdAt: new Date(),
    };

    commands.set(id, command);

    logger.info(`[Locker/cmd] Queued ${id}: ${lockerSN} door #${doorNum}`);

    return res.json({
      success: true,
      commandId: id,
      message: `Door open command queued for ${lockerSN} door #${doorNum}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/locker/commands?lockerSN=X ──────────────────────────────────────
// Kiosk polls this every 2-3 seconds. Returns pending commands, marks them processing.

router.get('/commands', (req: Request, res: Response) => {
  const lockerSN = req.query.lockerSN as string;
  if (!lockerSN) {
    return res.status(400).json({ success: false, message: 'lockerSN query param required' });
  }

  const now = Date.now();
  const pending: LockerCommand[] = [];

  for (const cmd of commands.values()) {
    if (cmd.lockerSN !== lockerSN) continue;
    if (cmd.status !== 'pending') continue;

    // Check TTL
    if (now - cmd.createdAt.getTime() > TTL_SECONDS * 1000) {
      cmd.status = 'expired';
      continue;
    }

    cmd.status = 'processing';
    pending.push(cmd);
  }

  if (pending.length > 0) {
    logger.info(`[Locker/cmd] ${lockerSN} picked up ${pending.length} command(s)`);
  }

  return res.json(pending);
});

// ── POST /api/locker/commands/:id/ack ────────────────────────────────────────
// Kiosk reports back after executing.

router.post('/commands/:id/ack', (req: Request, res: Response) => {
  const cmd = commands.get(String(req.params.id));
  if (!cmd) {
    return res.status(404).json({ success: false, message: 'Command not found' });
  }

  const { success, error } = req.body;

  if (success) {
    cmd.status = 'completed';
    cmd.processedAt = new Date();
    logger.info(`[Locker/cmd] ${cmd.id} completed: ${cmd.lockerSN} door #${cmd.doorNum}`);
  } else {
    cmd.status = 'failed';
    cmd.error = error || 'Unknown error';
    cmd.processedAt = new Date();
    logger.warn(`[Locker/cmd] ${cmd.id} failed: ${cmd.error}`);
  }

  return res.json({ success: true, status: cmd.status });
});

// ── GET /api/locker/commands/:id ─────────────────────────────────────────────
// Check status of a specific command (test page polls this).

router.get('/commands/:id', (req: Request, res: Response) => {
  const cmd = commands.get(String(req.params.id));
  if (!cmd) {
    return res.status(404).json({ success: false, message: 'Command not found' });
  }
  return res.json(cmd);
});

export { router as lockerCommandsRouter };
