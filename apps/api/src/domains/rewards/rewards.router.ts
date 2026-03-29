import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate, requireCustomer);

router.get('/', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const { skip, take, page, pageSize } = parsePagination(req);

    const [points, total, summary] = await Promise.all([
      prisma.rewardPoint.findMany({ where: { customerId: customer.id }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.rewardPoint.count({ where: { customerId: customer.id } }),
      prisma.rewardPoint.aggregate({
        where: { customerId: customer.id, redeemedAt: null },
        _sum: { points: true },
      }),
    ]);

    res.json({ ...paginated(points, total, page, pageSize), totalPoints: summary._sum.points ?? 0 });
  } catch (e) { next(e); }
});

// Award points (called internally — e.g. after delivery)
router.post('/award', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const rp = await prisma.rewardPoint.create({
      data: { customerId: customer.id, points: req.body.points, action: req.body.action, description: req.body.description },
    });
    res.status(201).json(success(rp));
  } catch (e) { next(e); }
});

export { router as rewardsRouter };
