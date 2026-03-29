import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCourier } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { events } from '../../shared/events/eventBus';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate);

// Courier — get their own tasks
router.get('/my', requireCourier, async (req, res, next) => {
  try {
    const courier = await prisma.courier.findUnique({ where: { userId: req.user!.id } });
    if (!courier) throw new NotFoundError('Courier profile not found');

    const tasks = await prisma.task.findMany({
      where: { courierId: courier.id },
      orderBy: { assignedAt: 'desc' },
      include: { package: true },
      take: 50,
    });
    res.json(success(tasks));
  } catch (e) { next(e); }
});

// Courier — accept a task
router.patch('/:id/accept', requireCourier, async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: { status: 'accepted', acceptedAt: new Date() },
    });
    await prisma.package.update({
      where: { id: task.packageId },
      data: { status: 'accepted' },
    });
    res.json(success(task));
  } catch (e) { next(e); }
});

// Courier — complete a task
router.patch('/:id/complete', requireCourier, async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: { status: 'completed', completedAt: new Date() },
    });
    res.json(success(task));
  } catch (e) { next(e); }
});

// Staff — list all tasks
router.get('/', authorize('packages.view'), async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { assignedAt: 'desc' },
      take: 100,
      include: {
        package: { select: { waybill: true, status: true, recipientName: true } },
        courier: { include: { user: { select: { name: true } } } },
      },
    });
    res.json(success(tasks));
  } catch (e) { next(e); }
});

export { router as tasksRouter };
