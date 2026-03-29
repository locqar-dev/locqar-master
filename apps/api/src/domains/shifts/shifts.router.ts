import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCourier } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/AppError';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate);

const createShiftSchema = z.object({
  courierId: z.string().uuid(),
  date: z.string(),
  startTime: z.string().optional(),
  notes: z.string().optional(),
});

// Courier — get own shifts
router.get('/my', requireCourier, async (req, res, next) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.user!.id } });
    if (!courier) throw new NotFoundError('Courier profile not found');
    const shifts = await prisma.shift.findMany({
      where: { courierId: courier.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(success(shifts));
  } catch (e) { next(e); }
});

// Courier — clock in
router.post('/clock-in', requireCourier, async (req, res, next) => {
  try {
    const courier = await prisma.courier.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await prisma.shift.findFirst({ where: { courierId: courier.id, date: today } });
    const shift = existing
      ? await prisma.shift.update({ where: { id: existing.id }, data: { startTime: new Date(), status: 'active' } })
      : await prisma.shift.create({ data: { courierId: courier.id, date: today, startTime: new Date(), status: 'active' } });
    res.json(success(shift));
  } catch (e) { next(e); }
});

// Courier — clock out
router.post('/clock-out', requireCourier, async (req, res, next) => {
  try {
    const courier = await prisma.courier.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const shift = await prisma.shift.findFirst({ where: { courierId: courier.id, date: today, status: 'active' } });
    if (!shift) throw new NotFoundError('No active shift found');

    const endTime = new Date();
    const hoursWorked = shift.startTime
      ? parseFloat(((endTime.getTime() - shift.startTime.getTime()) / 3600000).toFixed(2))
      : 0;

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: { endTime, status: 'completed', hoursWorked },
    });
    res.json(success(updated));
  } catch (e) { next(e); }
});

// Staff — list shifts
router.get('/', authorize('couriers.view'), async (req, res, next) => {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { date: 'desc' }, take: 100,
      include: { courier: { include: { user: { select: { name: true } } } } },
    });
    res.json(success(shifts));
  } catch (e) { next(e); }
});

// Staff — create shift
router.post('/', authorize('couriers.edit'), validate(createShiftSchema), async (req, res, next) => {
  try {
    const shift = await prisma.shift.create({ data: { ...req.body, date: new Date(req.body.date) } });
    res.status(201).json(success(shift));
  } catch (e) { next(e); }
});

export { router as shiftsRouter };
