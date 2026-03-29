import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();

// Public — list terminals for customer app
router.get('/public', async (_req, res, next) => {
  try {
    const terminals = await prisma.terminal.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, address: true, city: true, lat: true, lng: true },
      orderBy: { name: 'asc' },
    });
    res.json(success(terminals));
  } catch (e) { next(e); }
});

router.use(authenticate);

const terminalSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string(),
  city: z.string(),
  region: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

router.get('/', authorize('terminals.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.terminal.findMany({
        skip, take, orderBy: { name: 'asc' },
        include: {
          _count: { select: { staff: true, lockers: true, packages: true, couriers: true } },
        },
      }),
      prisma.terminal.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.get('/:id', authorize('terminals.view'), async (req, res, next) => {
  try {
    const t = await prisma.terminal.findUnique({
      where: { id: req.params.id as string },
      include: {
        lockers: true,
        _count: { select: { staff: true, couriers: true, packages: true } },
      },
    });
    if (!t) throw new NotFoundError('Terminal not found');
    res.json(success(t));
  } catch (e) { next(e); }
});

router.post('/', authorize('staff.create'), validate(terminalSchema), async (req, res, next) => {
  try {
    const terminal = await prisma.terminal.create({ data: req.body });
    res.status(201).json(success(terminal));
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('staff.edit'), async (req, res, next) => {
  try {
    const terminal = await prisma.terminal.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(terminal));
  } catch (e) { next(e); }
});

export { router as terminalsRouter };
