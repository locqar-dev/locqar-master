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

const TTL_SECONDS = 120;

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

    const command = await prisma.lockerCommand.create({
      data: {
        type: 'open-door',
        lockerSN,
        doorNum: Number(doorNum),
        status: 'pending',
      }
    });

    logger.info(`[Locker/cmd] Queued ${command.id}: ${lockerSN} door #${doorNum}`);

    return res.json({
      success: true,
      commandId: command.id,
      message: `Door open command queued for ${lockerSN} door #${doorNum}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/locker/commands?lockerSN=X ──────────────────────────────────────
// Kiosk polls this every 2-3 seconds. Returns pending commands, marks them processing.

router.get('/commands', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lockerSN = req.query.lockerSN as string;
    if (!lockerSN) {
      return res.status(400).json({ success: false, message: 'lockerSN query param required' });
    }

    const expiredThreshold = new Date(Date.now() - TTL_SECONDS * 1000);
    
    // Set expired ones
    await prisma.lockerCommand.updateMany({
      where: {
        lockerSN,
        status: 'pending',
        createdAt: { lt: expiredThreshold }
      },
      data: { status: 'expired' }
    });

    const pendingCmds = await prisma.lockerCommand.findMany({
      where: { lockerSN, status: 'pending' },
      orderBy: { createdAt: 'asc' }
    });

    if (pendingCmds.length > 0) {
      await prisma.lockerCommand.updateMany({
        where: { id: { in: pendingCmds.map(c => c.id) } },
        data: { status: 'processing' }
      });
      pendingCmds.forEach(c => c.status = 'processing');
      logger.info(`[Locker/cmd] ${lockerSN} picked up ${pendingCmds.length} command(s)`);
    }

    return res.json(pendingCmds);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/locker/commands/:id/ack ────────────────────────────────────────
// Kiosk reports back after executing.

router.post('/commands/:id/ack', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cmd = await prisma.lockerCommand.findUnique({ where: { id: String(req.params.id) } });
    if (!cmd) {
      return res.status(404).json({ success: false, message: 'Command not found' });
    }

    const { success, error } = req.body;

    const updated = await prisma.lockerCommand.update({
      where: { id: cmd.id },
      data: {
        status: success ? 'completed' : 'failed',
        error: success ? null : (error || 'Unknown error'),
        processedAt: new Date()
      }
    });

    if (success) {
      logger.info(`[Locker/cmd] ${cmd.id} completed: ${cmd.lockerSN} door #${cmd.doorNum}`);
    } else {
      logger.warn(`[Locker/cmd] ${cmd.id} failed: ${updated.error}`);
    }

    return res.json({ success: true, status: updated.status });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/locker/commands/:id ─────────────────────────────────────────────
// Check status of a specific command (test page polls this).

router.get('/commands/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cmd = await prisma.lockerCommand.findUnique({ where: { id: String(req.params.id) } });
    if (!cmd) {
      return res.status(404).json({ success: false, message: 'Command not found' });
    }
    return res.json(cmd);
  } catch (err) {
    next(err);
  }
});

export { router as lockerCommandsRouter };
