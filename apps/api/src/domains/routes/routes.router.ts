import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate, authorize('routes.view'));

router.get('/', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.route.findMany({
        skip, take, orderBy: { name: 'asc' },
        include: { terminal: { select: { name: true } }, stops: { orderBy: { sequence: 'asc' } } },
      }),
      prisma.route.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/', authorize('routes.create'), async (req, res, next) => {
  try {
    const { stops, ...routeData } = req.body;
    const route = await prisma.route.create({
      data: { ...routeData, stops: stops ? { create: stops } : undefined },
      include: { stops: true },
    });
    res.status(201).json(success(route));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const route = await prisma.route.findUnique({ where: { id: req.params.id as string }, include: { stops: { orderBy: { sequence: 'asc' } } } });
    if (!route) throw new NotFoundError('Route not found');
    res.json(success(route));
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('routes.edit'), async (req, res, next) => {
  try {
    const route = await prisma.route.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(route));
  } catch (e) { next(e); }
});

export { router as routesRouter };
