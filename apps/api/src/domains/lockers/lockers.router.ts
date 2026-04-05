import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { LockersService } from './lockers.service';
import { success } from '../../shared/utils/response';
import { createLockerSchema, updateLockerSchema, bulkCreateLockerSchema } from './lockers.validation';
import { config } from '../../config';

const router = Router();

// ── Public — availability check (for customer app) ──────────────────────────

router.get('/availability', async (req, res, next) => {
  try { res.json(success(await LockersService.availability(req.query.terminalId as string))); } catch (e) { next(e); }
});

// ── PIN cache — x-api-key auth (for kiosk offline mode) ─────────────────────

const LOCKER_API_KEY = process.env.LOCKER_API_KEY || config.winnsen.inboundApiKey;

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'] as string | undefined;
  if (!key || key !== LOCKER_API_KEY) {
    res.status(401).json({ success: false, message: 'Invalid API key' });
    return;
  }
  next();
}

router.get('/pin-cache', requireApiKey, async (req, res, next) => {
  try {
    const terminalId = req.query.terminalId as string;
    if (!terminalId) {
      res.status(400).json({ success: false, message: 'terminalId query param required' });
      return;
    }
    res.json(success(await LockersService.getPinCache(terminalId)));
  } catch (e) { next(e); }
});

// ── Authenticated routes ────────────────────────────────────────────────────

router.use(authenticate);

router.get('/', authorize('lockers.view'), async (req, res, next) => {
  try { res.json(success(await LockersService.list(req.query.terminalId as string))); } catch (e) { next(e); }
});

router.get('/:id', authorize('lockers.view'), async (req, res, next) => {
  try { res.json(success(await LockersService.getById(req.params.id as string))); } catch (e) { next(e); }
});

router.post('/', authorize('lockers.create'), validate(createLockerSchema), async (req, res, next) => {
  try { res.status(201).json(success(await LockersService.create(req.body))); } catch (e) { next(e); }
});

router.post('/bulk', authorize('lockers.create'), validate(bulkCreateLockerSchema), async (req, res, next) => {
  try { res.status(201).json(success(await LockersService.bulkCreate(req.body))); } catch (e) { next(e); }
});

router.put('/:id', authorize('lockers.edit'), validate(updateLockerSchema), async (req, res, next) => {
  try { res.json(success(await LockersService.update(req.params.id as string, req.body))); } catch (e) { next(e); }
});

router.delete('/:id', authorize('lockers.delete'), async (req, res, next) => {
  try { res.json(success(await LockersService.delete(req.params.id as string))); } catch (e) { next(e); }
});

router.post('/:id/open', authorize('lockers.open'), async (req, res, next) => {
  try { res.json(success(await LockersService.open(req.params.id as string, req.user!.id))); } catch (e) { next(e); }
});

router.patch('/:id/status', authorize('lockers.edit'), async (req, res, next) => {
  try { res.json(success(await LockersService.updateStatus(req.params.id as string, req.body.status))); } catch (e) { next(e); }
});

export { router as lockersRouter };
