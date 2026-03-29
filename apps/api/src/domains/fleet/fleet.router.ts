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
router.use(authenticate);

const vehicleSchema = z.object({
  plateNo: z.string().min(1),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1990).max(2030),
  type: z.enum(['motorcycle', 'bicycle', 'van', 'truck', 'car']),
  fuelType: z.string().default('petrol'),
  mileage: z.number().int().min(0).default(0),
  lastServiceDate: z.string().optional(),
  nextServiceDate: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authorize('fleet.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.type) where.type = q.type;

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { courier: { include: { user: { select: { name: true } } } } },
      }),
      prisma.vehicle.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/', authorize('fleet.create'), validate(vehicleSchema), async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.status(201).json(success(vehicle));
  } catch (e) { next(e); }
});

router.get('/:id', authorize('fleet.view'), async (req, res, next) => {
  try {
    const v = await prisma.vehicle.findUnique({ where: { id: req.params.id as string }, include: { courier: { include: { user: { select: { name: true } } } } } });
    if (!v) throw new NotFoundError('Vehicle not found');
    res.json(success(v));
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('fleet.edit'), async (req, res, next) => {
  try {
    const v = await prisma.vehicle.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(v));
  } catch (e) { next(e); }
});

router.delete('/:id', authorize('fleet.edit'), async (req, res, next) => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id as string } });
    res.json(success({ message: 'Vehicle deleted' }));
  } catch (e) { next(e); }
});

export { router as fleetRouter };
