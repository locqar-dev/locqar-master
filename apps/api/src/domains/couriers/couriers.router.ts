import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { CouriersService } from './couriers.service';
import { success } from '../../shared/utils/response';

const router = Router();
router.use(authenticate);

router.get('/', authorize('couriers.view'), async (req, res, next) => {
  try { res.json(await CouriersService.list(req.user!, req)); } catch (e) { next(e); }
});

router.get('/:id', authorize('couriers.view'), async (req, res, next) => {
  try { res.json(success(await CouriersService.getById(req.params.id as string))); } catch (e) { next(e); }
});

router.get('/:id/stats', authorize('couriers.view'), async (req, res, next) => {
  try { res.json(success(await CouriersService.getStats(req.params.id as string))); } catch (e) { next(e); }
});

router.patch('/:id/status', authorize('couriers.edit'), async (req, res, next) => {
  try { res.json(success(await CouriersService.updateStatus(req.params.id as string, req.body.status))); } catch (e) { next(e); }
});

export { router as couriersRouter };
