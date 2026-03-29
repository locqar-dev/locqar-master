import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate);

/** Resolve a QR code scan — returns the entity it refers to */
router.post('/resolve', async (req, res, next) => {
  try {
    const { code, type } = req.body;

    if (type === 'package' || code.startsWith('LQ-')) {
      const pkg = await prisma.package.findUnique({
        where: { waybill: code },
        select: { id: true, waybill: true, status: true, recipientName: true, size: true },
      });
      if (!pkg) throw new NotFoundError('Package not found');
      return res.json(success({ type: 'package', data: pkg }));
    }

    if (type === 'locker') {
      const locker = await prisma.locker.findUnique({
        where: { serialNo: code },
        select: { id: true, name: true, status: true, size: true, terminalId: true },
      });
      if (!locker) throw new NotFoundError('Locker not found');
      return res.json(success({ type: 'locker', data: locker }));
    }

    if (type === 'courier') {
      const courier = await prisma.courier.findUnique({
        where: { cardNo: code },
        include: { user: { select: { name: true } } },
      });
      if (!courier) throw new NotFoundError('Courier not found');
      return res.json(success({ type: 'courier', data: courier }));
    }

    throw new NotFoundError('Unknown QR code type');
  } catch (e) { next(e); }
});

export { router as qrRouter };
