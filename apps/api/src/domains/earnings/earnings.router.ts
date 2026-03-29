import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCourier } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate);

// Courier — own earnings
router.get('/my', requireCourier, async (req, res, next) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.user!.id } });
    if (!courier) throw new NotFoundError('Courier profile not found');

    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.earning.findMany({ where: { courierId: courier.id }, skip, take, orderBy: { periodStart: 'desc' } }),
      prisma.earning.count({ where: { courierId: courier.id } }),
    ]);

    // Summary stats
    const summary = await prisma.earning.aggregate({
      where: { courierId: courier.id },
      _sum: { totalAmount: true, deliveries: true },
      _avg: { totalAmount: true },
    });

    res.json({ ...paginated(data, total, page, pageSize), summary: summary._sum });
  } catch (e) { next(e); }
});

// Staff — all earnings
router.get('/', authorize('couriers.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.earning.findMany({
        skip, take,
        orderBy: { periodStart: 'desc' },
        include: { courier: { include: { user: { select: { name: true } } } } },
      }),
      prisma.earning.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Staff — create earning record
router.post('/', authorize('couriers.edit'), async (req, res, next) => {
  try {
    const earning = await prisma.earning.create({ data: req.body });
    res.status(201).json(success(earning));
  } catch (e) { next(e); }
});

export { router as earningsRouter };
