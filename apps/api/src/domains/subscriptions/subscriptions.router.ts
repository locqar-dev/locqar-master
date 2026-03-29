import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer, authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';

const router = Router();

// Public — list plans
router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
    res.json(success(plans));
  } catch (e) { next(e); }
});

router.use(authenticate);

// Customer — get own subscription
router.get('/me', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const sub = await prisma.subscription.findFirst({
      where: { customerId: customer.id, status: 'active' },
      include: { plan: true },
    });
    res.json(success(sub ?? null));
  } catch (e) { next(e); }
});

// Customer — subscribe to plan
router.post('/subscribe', requireCustomer, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new NotFoundError('Plan not found');

    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });

    // Cancel existing
    await prisma.subscription.updateMany({
      where: { customerId: customer.id, status: 'active' },
      data: { status: 'cancelled' },
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.billingCycleDays * 86400000);

    const sub = await prisma.subscription.create({
      data: { customerId: customer.id, planId, status: 'active', startDate, endDate },
      include: { plan: true },
    });

    res.status(201).json(success(sub));
  } catch (e) { next(e); }
});

// Customer — cancel
router.post('/cancel', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    await prisma.subscription.updateMany({
      where: { customerId: customer.id, status: 'active' },
      data: { status: 'cancelled', autoRenew: false },
    });
    res.json(success({ message: 'Subscription cancelled' }));
  } catch (e) { next(e); }
});

// Staff — manage plans
router.post('/plans', authorize('settings.view'), async (req, res, next) => {
  try {
    const plan = await prisma.subscriptionPlan.create({ data: req.body });
    res.status(201).json(success(plan));
  } catch (e) { next(e); }
});

export { router as subscriptionsRouter };
