import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate, authorize('fleet.view'));

router.get('/', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.driver.findMany({
        skip, take, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
      prisma.driver.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!driver) throw new NotFoundError('Driver not found');
    res.json(success(driver));
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('fleet.edit'), async (req, res, next) => {
  try {
    const driver = await prisma.driver.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(driver));
  } catch (e) { next(e); }
});

export { router as driversRouter };
