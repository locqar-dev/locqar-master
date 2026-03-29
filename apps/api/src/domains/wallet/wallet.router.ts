import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(authenticate, requireCustomer);

async function getWallet(userId: string) {
  const customer = await prisma.customer.findUnique({ where: { userId }, include: { wallet: true } });
  if (!customer?.wallet) throw new NotFoundError('Wallet not found');
  return { customer, wallet: customer.wallet };
}

router.get('/', async (req, res, next) => {
  try {
    const { wallet } = await getWallet(req.user!.id);
    res.json(success(wallet));
  } catch (e) { next(e); }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const { wallet } = await getWallet(req.user!.id);
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Top up (in production: creates a payment intent, credited after payment webhook)
router.post('/topup', async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new BadRequestError('Invalid amount');
    const { wallet } = await getWallet(req.user!.id);

    const newBalance = wallet.balance + amount;
    const [tx, updated] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount,
          balance: newBalance,
          description: 'Wallet top-up',
          reference: uuid(),
        },
      }),
      prisma.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } }),
    ]);

    res.json(success({ transaction: tx, newBalance: updated.balance }));
  } catch (e) { next(e); }
});

// Deduct from wallet (internal, used by payment service)
router.post('/deduct', async (req, res, next) => {
  try {
    const { amount, description, reference } = req.body;
    const { wallet } = await getWallet(req.user!.id);

    if (wallet.balance < amount) throw new BadRequestError('Insufficient wallet balance');

    const newBalance = wallet.balance - amount;
    const [tx, updated] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: 'debit', amount, balance: newBalance, description, reference },
      }),
      prisma.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } }),
    ]);

    res.json(success({ transaction: tx, newBalance: updated.balance }));
  } catch (e) { next(e); }
});

export { router as walletRouter };
