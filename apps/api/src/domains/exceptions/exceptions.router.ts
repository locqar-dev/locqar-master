import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate);

router.get('/', authorize('packages.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.type) where.type = q.type;

    const [data, total] = await Promise.all([
      prisma.exception.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { package: { select: { waybill: true, recipientName: true, terminal: { select: { name: true } } } } },
      }),
      prisma.exception.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const exception = await prisma.exception.create({
      data: { ...req.body, reportedBy: req.user!.id },
    });
    res.status(201).json(success(exception));
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const exception = await prisma.exception.update({ where: { id: req.params.id }, data: req.body });
    res.json(success(exception));
  } catch (e) { next(e); }
});

router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const exception = await prisma.exception.update({
      where: { id: req.params.id },
      data: { status: 'resolved', resolvedBy: req.user!.id, resolvedAt: new Date(), resolution: req.body.resolution },
    });
    res.json(success(exception));
  } catch (e) { next(e); }
});

export { router as exceptionsRouter };
