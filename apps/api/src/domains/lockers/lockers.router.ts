import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { LockersService } from './lockers.service';
import { success } from '../../shared/utils/response';

const router = Router();

// Public — availability check (for customer app)
router.get('/availability', async (req, res, next) => {
  try { res.json(success(await LockersService.availability(req.query.terminalId as string))); } catch (e) { next(e); }
});

router.use(authenticate);

router.get('/', authorize('lockers.view'), async (req, res, next) => {
  try { res.json(success(await LockersService.list(req.query.terminalId as string))); } catch (e) { next(e); }
});

router.get('/:id', authorize('lockers.view'), async (req, res, next) => {
  try { res.json(success(await LockersService.getById(req.params.id as string))); } catch (e) { next(e); }
});

router.post('/:id/open', authorize('lockers.open'), async (req, res, next) => {
  try { res.json(success(await LockersService.open(req.params.id as string, req.user!.id))); } catch (e) { next(e); }
});

router.patch('/:id/status', authorize('lockers.edit'), async (req, res, next) => {
  try { res.json(success(await LockersService.updateStatus(req.params.id as string, req.body.status))); } catch (e) { next(e); }
});

export { router as lockersRouter };
