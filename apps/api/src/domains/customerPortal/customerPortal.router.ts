import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { generateApiKey } from '../../shared/utils/crypto';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate, requireCustomer);

async function getCustomer(userId: string) {
  const c = await prisma.customer.findUnique({ where: { userId } });
  if (!c) throw new NotFoundError('Customer not found');
  return c;
}

// Shipment dashboard (enterprise portal)
router.get('/shipments', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;

    const where: any = { customerId: customer.id };
    if (q.status) where.status = q.status;
    if (q.search) where.OR = [
      { waybill: { contains: q.search, mode: 'insensitive' } },
      { recipientName: { contains: q.search, mode: 'insensitive' } },
    ];

    const [data, total] = await Promise.all([
      prisma.package.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { terminal: { select: { name: true } }, locker: { select: { name: true } } },
      }),
      prisma.package.count({ where }),
    ]);

    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Create shipment from portal
router.post('/shipments', async (req, res, next) => {
  try {
    // Delegate to packages service flow
    res.status(501).json({ success: false, error: 'Use POST /api/v1/packages' });
  } catch (e) { next(e); }
});

// Analytics / usage stats for enterprise customer
router.get('/analytics', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const packageWhere = { customerId: customer.id };

    const [total, byStatus, recent] = await Promise.all([
      prisma.package.count({ where: packageWhere }),
      prisma.package.groupBy({ by: ['status'], where: packageWhere, _count: true }),
      prisma.package.findMany({ where: packageWhere, take: 5, orderBy: { createdAt: 'desc' }, select: { waybill: true, status: true, createdAt: true } }),
    ]);

    res.json(success({ total, byStatus, recent }));
  } catch (e) { next(e); }
});

// API Keys
router.get('/api-keys', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const keys = await prisma.partnerApiKey.findMany({
      where: { customerId: customer.id },
      select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, expiresAt: true, isActive: true, createdAt: true },
    });
    res.json(success(keys));
  } catch (e) { next(e); }
});

router.post('/api-keys', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const { key, keyHash, keyPrefix } = generateApiKey('lq');
    const apiKey = await prisma.partnerApiKey.create({
      data: {
        customerId: customer.id,
        name: req.body.name,
        keyHash,
        keyPrefix,
        permissions: req.body.permissions ?? ['shipments.read'],
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      },
    });
    // Return full key ONCE — never again
    res.status(201).json(success({ ...apiKey, key }));
  } catch (e) { next(e); }
});

router.delete('/api-keys/:id', async (req, res, next) => {
  try {
    await prisma.partnerApiKey.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json(success({ message: 'API key revoked' }));
  } catch (e) { next(e); }
});

// Webhooks
router.get('/webhooks', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const webhooks = await prisma.webhook.findMany({ where: { customerId: customer.id } });
    res.json(success(webhooks));
  } catch (e) { next(e); }
});

router.post('/webhooks', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const { generateToken } = await import('../../shared/utils/crypto');
    const webhook = await prisma.webhook.create({
      data: {
        customerId: customer.id,
        url: req.body.url,
        events: req.body.events,
        secret: generateToken(24),
      },
    });
    res.status(201).json(success(webhook));
  } catch (e) { next(e); }
});

router.delete('/webhooks/:id', async (req, res, next) => {
  try {
    await prisma.webhook.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json(success({ message: 'Webhook deactivated' }));
  } catch (e) { next(e); }
});

// Contacts (team members)
router.get('/contacts', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const contacts = await prisma.crmContact.findMany({ where: { customerId: customer.id } });
    res.json(success(contacts));
  } catch (e) { next(e); }
});

router.post('/contacts', async (req, res, next) => {
  try {
    const customer = await getCustomer(req.user!.id);
    const contact = await prisma.crmContact.create({ data: { ...req.body, customerId: customer.id } });
    res.status(201).json(success(contact));
  } catch (e) { next(e); }
});

router.delete('/contacts/:id', async (req, res, next) => {
  try {
    await prisma.crmContact.delete({ where: { id: req.params.id } });
    res.json(success({ message: 'Contact removed' }));
  } catch (e) { next(e); }
});

export { router as customerPortalRouter };
