import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate, authorize('alerts.view'));

router.get('/', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = {};
    if (q.severity) where.severity = q.severity;
    if (q.terminalId) where.terminalId = q.terminalId;
    if (q.unread === 'true') where.isRead = false;

    const [data, total] = await Promise.all([
      prisma.alert.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { terminal: { select: { name: true } } } }),
      prisma.alert.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const alert = await prisma.alert.create({ data: req.body });
    res.status(201).json(success(alert));
  } catch (e) { next(e); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const alert = await prisma.alert.update({ where: { id: req.params.id as string }, data: { isRead: true } });
    res.json(success(alert));
  } catch (e) { next(e); }
});

router.patch('/:id/resolve', authorize('alerts.resolve'), async (req, res, next) => {
  try {
    const alert = await prisma.alert.update({ where: { id: req.params.id as string }, data: { resolvedAt: new Date() } });
    res.json(success(alert));
  } catch (e) { next(e); }
});

router.post('/mark-all-read', async (req, res, next) => {
  try {
    await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
    res.json(success({ message: 'All alerts marked as read' }));
  } catch (e) { next(e); }
});

export { router as alertsRouter };
