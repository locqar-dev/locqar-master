import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { BadRequestError } from '../../shared/errors/AppError';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(authenticate, requireCustomer);

router.get('/', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.payment.findMany({ where: { customerId: customer.id }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.payment.count({ where: { customerId: customer.id } }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Initiate a payment (MoMo or card)
router.post('/initiate', async (req, res, next) => {
  try {
    const { amount, method, description } = req.body;
    if (!amount || amount <= 0) throw new BadRequestError('Invalid amount');

    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const reference = `LQ-PAY-${Date.now()}-${uuid().slice(0, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        customerId: customer.id,
        method,
        amount,
        reference,
        description,
        status: 'pending',
      },
    });

    // In production: call MTN MoMo or card gateway API here
    // const momoResponse = await momoProvider.requestPayment({ amount, phone, reference });

    res.status(201).json(success({ payment, reference, message: 'Payment initiated. Approve on your phone.' }));
  } catch (e) { next(e); }
});

// Webhook from payment gateway (no auth — verify signature)
router.post('/webhook', async (req, res, next) => {
  try {
    // In production: verify webhook signature
    const { reference, status, externalRef } = req.body;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }

    await prisma.payment.update({
      where: { reference },
      data: {
        status,
        externalRef,
        completedAt: status === 'completed' ? new Date() : undefined,
        failedAt: status === 'failed' ? new Date() : undefined,
      },
    });

    // Credit wallet if payment completed
    if (status === 'completed') {
      const wallet = await prisma.wallet.findUnique({ where: { customerId: payment.customerId } });
      if (wallet) {
        const newBalance = wallet.balance + payment.amount;
        await prisma.$transaction([
          prisma.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } }),
          prisma.walletTransaction.create({
            data: {
              walletId: wallet.id, type: 'credit', amount: payment.amount,
              balance: newBalance, description: 'Payment received', reference,
            },
          }),
        ]);
      }
    }

    res.json({ received: true });
  } catch (e) { next(e); }
});

export { router as paymentsRouter };
