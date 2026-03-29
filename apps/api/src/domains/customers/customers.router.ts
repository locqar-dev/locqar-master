import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate);

// Customer — own profile
router.get('/me', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar: true } },
        addresses: true,
        wallet: true,
        subscriptions: { include: { plan: true }, where: { status: 'active' }, take: 1 },
      },
    });
    if (!customer) throw new NotFoundError('Customer profile not found');
    res.json(success(customer));
  } catch (e) { next(e); }
});

// Customer — own packages
router.get('/me/packages', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.package.findMany({
        where: { customerId: customer.id },
        skip, take, orderBy: { createdAt: 'desc' },
        select: { waybill: true, status: true, recipientName: true, size: true, createdAt: true, deliveredAt: true },
      }),
      prisma.package.count({ where: { customerId: customer.id } }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Customer — addresses
router.get('/me/addresses', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const addresses = await prisma.customerAddress.findMany({ where: { customerId: customer.id } });
    res.json(success(addresses));
  } catch (e) { next(e); }
});

router.post('/me/addresses', requireCustomer, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    if (req.body.isDefault) {
      await prisma.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    }
    const address = await prisma.customerAddress.create({ data: { ...req.body, customerId: customer.id } });
    res.status(201).json(success(address));
  } catch (e) { next(e); }
});

router.delete('/me/addresses/:id', requireCustomer, async (req, res, next) => {
  try {
    await prisma.customerAddress.delete({ where: { id: req.params.id as string } });
    res.json(success({ message: 'Address deleted' }));
  } catch (e) { next(e); }
});

// Staff — list all customers
router.get('/', authorize('customers.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = {};
    if (q.search) where.user = { OR: [
      { name: { contains: q.search, mode: 'insensitive' } },
      { email: { contains: q.search, mode: 'insensitive' } },
      { phone: { contains: q.search, mode: 'insensitive' } },
    ]};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          wallet: { select: { balance: true } },
          _count: { select: { packages: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.get('/:id', authorize('customers.view'), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: true,
        addresses: true,
        wallet: true,
        subscriptions: { include: { plan: true } },
        packages: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundError('Customer not found');
    res.json(success(customer));
  } catch (e) { next(e); }
});

export { router as customersRouter };
