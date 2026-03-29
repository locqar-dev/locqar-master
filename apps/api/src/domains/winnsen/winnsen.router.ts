/**
 * Winnsen Integration â two surfaces:
 *
 * 1. POST /api/winnsen/events      â kiosk hardware calls us directly
 *    Auth: x-api-key: WINNSEN_INBOUND_API_KEY
 *    Body: { action, ...params }
 *
 * 2. GET/POST /api/winnsen/callbacks/*  â Winnsen cloud calls us after locker events
 *    No auth (Winnsen doesn't send headers); security by obscurity is the standard pattern.
 *
 * Winnsen Cloud API (we call them) lives in src/shared/services/winnsen.cloud.ts
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { verifyPassword } from '../../shared/utils/crypto';
import { eventBus } from '../../shared/events/eventBus';
import { logger } from '../../shared/utils/logger';
import { doorClient } from '@locqar/door-controller/src/client';

const router = Router();

// ââ Inbound API key auth ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function requireInboundKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.winnsen.inboundApiKey) {
    res.status(401).json({ Status: 'Fail', Message: 'Unauthorized' });
    return;
  }
  next();
}

// ââ Helper: find locker by Winnsen SN ââââââââââââââââââââââââââââââââââââââââ

async function lockerBySN(sn: string) {
  return prisma.locker.findFirst({ where: { winnsenSn: sn } });
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// POST /api/winnsen/events
// Kiosk touchscreen hardware â our server (direct, not via Winnsen cloud)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

router.post('/events', requireInboundKey, async (req: Request, res: Response, next: NextFunction) => {
  const { action, ...body } = req.body as Record<string, string>;
  logger.info(`[Winnsen/events] action=${action}`, body);

  try {
    switch (action) {

      // ââ Agent (courier) login at kiosk ââââââââââââââââââââââââââââââââââââââ

      case 'agent-login-by-phone': {
        const { phone, password } = body;
        const user = await prisma.user.findFirst({
          where: { phone },
          include: { courier: true },
        });
        if (!user?.passwordHash || !await verifyPassword(password, user.passwordHash)) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid credentials' });
        }
        if (!user.courier) {
          return res.status(403).json({ Status: 'Fail', Message: 'Not a courier account' });
        }
        return res.json({ agentId: user.courier.id });
      }

      case 'agent-login-by-qr': {
        // qrToken = the QR code string stored on the courier's profile
        const { qrToken } = body;
        const courier = await prisma.courier.findFirst({ where: { qrCode: qrToken } });
        if (!courier) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid QR token' });
        }
        return res.json({ agentId: courier.id });
      }

      // ââ Member (partner/customer) login at kiosk ââââââââââââââââââââââââââââ

      case 'member-login-by-phone': {
        const { phone, password } = body;
        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user?.passwordHash || !await verifyPassword(password, user.passwordHash)) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid credentials' });
        }
        return res.json({ memberId: user.id });
      }

      case 'member-login-by-qr': {
        // qrToken = plain API key (hashed in DB â find by prefix match then full verify)
        const { qrToken } = body;
        if (!qrToken) return res.status(400).json({ Status: 'Fail', Message: 'qrToken required' });
        const prefix = qrToken.slice(0, 8);
        const key = await prisma.partnerApiKey.findFirst({
          where: { keyPrefix: prefix, isActive: true },
        });
        if (!key) return res.status(401).json({ Status: 'Fail', Message: 'Invalid QR token' });
        return res.json({ memberId: key.customerId });
      }

      // ââ Member package check âââââââââââââââââââââââââââââââââââââââââââââââââ

      case 'member-package': {
        // "Does this member have a package waiting at this locker?"
        const { memberId, lockerSN } = body;
        const locker = await lockerBySN(lockerSN);
        if (!locker) return res.json({ hasPackage: false });

        // memberId can be a User.id or Customer.id â try both
        const pkg = await prisma.package.findFirst({
          where: {
            lockerId: locker.id,
            status: 'delivered_to_locker',
            OR: [
              { customer: { userId: memberId } },
              { customerId: memberId },
            ],
          },
          select: { lockerDoorNo: true },
        });
        return res.json({
          hasPackage: !!pkg,
          ...(pkg?.lockerDoorNo && { doorNum: pkg.lockerDoorNo }),
        });
      }

      // ââ Agent order operations âââââââââââââââââââââââââââââââââââââââââââââââ

      case 'agent-validate-order': {
        const { orderNumber, lockerSN } = body;
        const pkg = await prisma.package.findFirst({ where: { waybill: orderNumber } });
        if (!pkg) return res.json({ Status: 'Fail', Message: 'Order not found' });
        const locker = await lockerBySN(lockerSN);
        return res.json({
          Status: 'Success',
          orderNumber,
          status: pkg.status,
          lockerMatch: locker ? pkg.lockerId === locker.id : false,
        });
      }

      case 'agent-list-orders': {
        const { lockerSN } = body;
        const locker = await lockerBySN(lockerSN);
        if (!locker) return res.json({ orderNumbers: [] });
        const pkgs = await prisma.package.findMany({
          where: {
            lockerId: locker.id,
            status: { in: ['delivered_to_locker', 'at_locker_pending_courier'] },
          },
          select: { waybill: true },
        });
        return res.json({ orderNumbers: pkgs.map(p => p.waybill) });
      }

      case 'agent-reuse-door': {
        // Agent wants to re-open the same door for an in-progress order
        const { orderNumber } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          select: { lockerDoorNo: true },
        });
        return res.json({
          hasDoor: !!pkg?.lockerDoorNo,
          ...(pkg?.lockerDoorNo && { doorNum: pkg.lockerDoorNo }),
        });
      }

      case 'validate-box-order': {
        const { orderNumber, boxSN } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          include: { locker: true },
        });
        if (!pkg) return res.json({ Status: 'Fail', Message: 'Order not found' });
        const matches = pkg.locker?.winnsenSn === boxSN;
        return res.json({ Status: matches ? 'Success' : 'Fail', Message: matches ? '' : 'Locker mismatch' });
      }

      // ââ Physical locker events (door closed after drop/collect) âââââââââââââ

      case 'order-dropoff': {
        // Package placed in locker, door closed
        const { orderNumber, lockerSN, doorNum, owner } = body;
        const locker = await lockerBySN(lockerSN);
        if (!locker) return res.json({ Status: 'Fail', Message: 'Locker not found' });

        const newStatus = owner === 'agent'
          ? 'delivered_to_locker'     // agent delivering to recipient
          : 'at_locker_pending_courier'; // sender dropped off, courier picks up

        await prisma.$transaction([
          prisma.package.updateMany({
            where: { waybill: orderNumber },
            data: {
              status: newStatus as any,
              lockerId: locker.id,
              lockerDoorNo: Number(doorNum),
              deliveredAt: new Date(),
            },
          }),
          prisma.locker.update({
            where: { id: locker.id },
            data: { status: 'occupied' },
          }),
          prisma.lockerEvent.create({
            data: {
              lockerId: locker.id,
              eventType: 'dropoff',
              triggeredBy: owner,
              metadata: { orderNumber, doorNum },
            },
          }),
        ]);

        eventBus.emit('package:status_changed', { waybill: orderNumber, status: newStatus });
        logger.info(`[Winnsen] order-dropoff waybill=${orderNumber} door=${doorNum} sn=${lockerSN}`);
        return res.json({ Status: 'Success', Message: '' });
      }

      case 'order-collected': {
        // Package taken from locker, door closed
        const { orderNumber, lockerSN, doorNum, owner } = body;
        const locker = await lockerBySN(lockerSN);

        const newStatus = owner === 'agent' ? 'recalled' : 'picked_up';

        await prisma.$transaction([
          prisma.package.updateMany({
            where: { waybill: orderNumber },
            data: {
              status: newStatus as any,
              lockerDoorNo: null,
              pickedUpAt: new Date(),
            },
          }),
          ...(locker ? [
            prisma.locker.update({
              where: { id: locker.id },
              data: { status: 'available' },
            }),
            prisma.lockerEvent.create({
              data: {
                lockerId: locker.id,
                eventType: 'collected',
                triggeredBy: owner,
                metadata: { orderNumber, doorNum },
              },
            }),
          ] : []),
        ]);

        eventBus.emit('package:status_changed', { waybill: orderNumber, status: newStatus });
        logger.info(`[Winnsen] order-collected waybill=${orderNumber} owner=${owner} sn=${lockerSN}`);
        return res.json({ Status: 'Success', Message: '' });
      }

      // ââ Payment at kiosk âââââââââââââââââââââââââââââââââââââââââââââââââââââ

      case 'order-payment': {
        // "Has this order been paid for?"
        const { orderNumber } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          select: { isPaid: true },
        });
        return res.json({ hasPayment: pkg?.isPaid ?? false });
      }

      case 'generate-payment-page': {
        // Return a Paystack checkout URL for the kiosk screen to display
        const { orderNumber } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          select: { id: true, price: true },
        });
        if (!pkg) return res.json({ Status: 'Fail', Message: 'Order not found' });

        // In production: initialize a Paystack transaction here via your payments service
        // For now: return a URL pattern the frontend can handle
        const expiredAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const url = `${config.urls.customer}/pay?order=${orderNumber}`;
        return res.json({ url, expiredAt, orderNumber });
      }


      // ── Local door control (replaces Winnsen cloud SetDoorOpen) ──────────
      case 'open-door': {
        const { doorNumber, lockerSN } = body;
        if (!doorNumber) {
          return res.status(400).json({ Status: 'Fail', Message: 'doorNumber required' });
        }
        const result = await doorClient.openDoor(Number(doorNumber));
        logger.info(`[Winnsen/local] open-door door=${doorNumber} success=${result.success}`);
        return res.json({
          Status: result.success ? 'Success' : 'Fail',
          Message: result.error || '',
          door: result.door,
        });
      }

      // ── Local door status (replaces Winnsen cloud GetTerminalInfo) ───────
      case 'door-status': {
        const { doorNumber: dn, station: st } = body;
        if (dn) {
          const result = await doorClient.getDoorStatus(Number(dn));
          return res.json({ Status: result.success ? 'Success' : 'Fail', door: result.door, doorStatus: result.status });
        }
        if (st) {
          const result = await doorClient.getStationStatus(Number(st));
          return res.json({ Status: 'Success', doors: result.doors });
        }
        return res.status(400).json({ Status: 'Fail', Message: 'doorNumber or station required' });
      }

      // ── Verify pickup code + open door (full local flow) ────────────────
      case 'verify-pickup-code': {
        const { code } = body;
        if (!code) {
          return res.status(400).json({ Status: 'Fail', Message: 'code required' });
        }
        const pkg = await prisma.package.findFirst({
          where: { pickupCode: code, status: 'delivered_to_locker' },
          select: { id: true, waybill: true, lockerDoorNo: true, lockerId: true },
        });
        if (!pkg) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid or expired code' });
        }
        if (!pkg.lockerDoorNo) {
          return res.status(400).json({ Status: 'Fail', Message: 'No door assigned to this package' });
        }
        const openResult = await doorClient.openDoor(pkg.lockerDoorNo);
        if (!openResult.success) {
          logger.error(`[Winnsen/local] Failed to open door ${pkg.lockerDoorNo} for pickup code ${code}`);
          return res.status(500).json({ Status: 'Fail', Message: 'Door failed to open' });
        }
        logger.info(`[Winnsen/local] verify-pickup-code code=${code} waybill=${pkg.waybill} door=${pkg.lockerDoorNo}`);
        return res.json({
          Status: 'Success',
          waybill: pkg.waybill,
          doorNumber: pkg.lockerDoorNo,
          message: 'Door opened. Please collect your package.',
        });
      }

      // ── Generate pickup code locally (replaces Winnsen cloud SetPinCode) ─
      case 'generate-pickup-code': {
        const { orderNumber: on } = body;
        if (!on) {
          return res.status(400).json({ Status: 'Fail', Message: 'orderNumber required' });
        }
        const pickupCode = String(Math.floor(100000 + Math.random() * 900000));
        const updated = await prisma.package.updateMany({
          where: { waybill: on },
          data: { pickupCode },
        });
        if (updated.count === 0) {
          return res.status(404).json({ Status: 'Fail', Message: 'Order not found' });
        }
        logger.info(`[Winnsen/local] generate-pickup-code waybill=${on} code=${pickupCode}`);
        return res.json({ Status: 'Success', pickupCode, orderNumber: on });
      }


      default:
        return res.status(400).json({ Status: 'Fail', Message: `Unknown action: ${action}` });
    }
  } catch (err) {
    next(err);
  }
});

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Winnsen Cloud callbacks â Winnsen calls these after locker events
// Mounted at /api/winnsen/callbacks/*
// Winnsen uses GET with query-string params for most callbacks
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const cb = Router();

// GET /callbacks/check-courier
// Winnsen asks us: "Is this courier allowed to operate?"
cb.get('/check-courier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, account, password, card } = req.query as Record<string, string>;
    let found = false;
    let courierName: string | undefined;

    if (type === '2' && card) {
      // Card-based â look up by cardNo
      const courier = await prisma.courier.findFirst({
        where: { cardNo: card },
        include: { user: { select: { name: true } } },
      });
      found = !!courier;
      courierName = courier?.user.name;
    } else {
      // Phone + password
      const user = await prisma.user.findFirst({
        where: { phone: account },
        include: { courier: true },
      });
      if (user?.courier && user.passwordHash) {
        found = await verifyPassword(password, user.passwordHash);
        courierName = user.name;
      }
    }

    if (!found) {
      return res.json({ Status: 'Fail', Data: [], Message: 'Courier not found' });
    }
    return res.json({
      Status: 'Success',
      Data: courierName ? [{ Name: courierName }] : [],
      Message: '',
    });
  } catch (err) { next(err); }
});

// GET /callbacks/check-parcel
// Winnsen asks us: "Is this waybill valid? Return recipient phone for PIN SMS."
cb.get('/check-parcel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno } = req.query as Record<string, string>;
    const pkg = await prisma.package.findFirst({
      where: { waybill: waybillno },
      select: { recipientPhone: true, status: true },
    });

    if (!pkg) {
      return res.json({ Status: 'Fail', Data: [], Message: 'Waybill not found' });
    }

    // Strip country code (+233 â 0...) â Winnsen expects local format
    const phone = pkg.recipientPhone?.replace(/^\+233/, '0') ?? '';
    return res.json({ Status: 'Success', Data: [{ Phone: phone }], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/courier-dropoff
// Winnsen tells us: courier just dropped off a package
cb.post('/courier-dropoff', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn, doorno, pickupcode } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: {
        status: 'delivered_to_locker',
        lockerDoorNo: Number(doorno),
        pickupCode: pickupcode,
        deliveredAt: new Date(),
      },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'occupied' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'delivered_to_locker' });
    logger.info(`[Winnsen/cb] courier-dropoff waybill=${waybillno} door=${doorno} locker=${terminalsn}`);
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/recipient-pickup
// Winnsen tells us: recipient collected their package
cb.post('/recipient-pickup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'picked_up', lockerDoorNo: null, pickedUpAt: new Date() },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'available' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'picked_up' });
    logger.info(`[Winnsen/cb] recipient-pickup waybill=${waybillno} locker=${terminalsn}`);
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/courier-recall
// Winnsen tells us: courier recalled an uncollected package
cb.post('/courier-recall', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'recalled', lockerDoorNo: null },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'available' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'recalled' });
    logger.info(`[Winnsen/cb] courier-recall waybill=${waybillno}`);
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/sender-dropoff
// Winnsen tells us: sender dropped off a package (send flow)
cb.post('/sender-dropoff', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn, doorno } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'at_locker_pending_courier' as any, lockerDoorNo: Number(doorno) },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'occupied' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'at_locker_pending_courier' });
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/courier-pickup
// Winnsen tells us: courier picked up sender's parcel from locker
cb.post('/courier-pickup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'in_transit_to_locker', lockerDoorNo: null },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'available' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'in_transit_to_locker' });
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/recipient-return
// Winnsen tells us: recipient returned a package to the locker
cb.post('/recipient-return', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn, doorno } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'return_at_locker' as any, lockerDoorNo: Number(doorno) },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'occupied' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'return_at_locker' });
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// POST /callbacks/courier-pick-returned
// Winnsen tells us: courier collected the returned package from the locker
cb.post('/courier-pick-returned', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { waybillno, terminalsn } = req.body as Record<string, string>;

    await prisma.package.updateMany({
      where: { waybill: waybillno },
      data: { status: 'return_in_transit' as any, lockerDoorNo: null },
    });

    const locker = await lockerBySN(terminalsn);
    if (locker) {
      await prisma.locker.update({ where: { id: locker.id }, data: { status: 'available' } });
    }

    eventBus.emit('package:status_changed', { waybill: waybillno, status: 'return_in_transit' });
    return res.json({ Status: 'Success', Data: [], Message: '' });
  } catch (err) { next(err); }
});

// Mount callbacks sub-router
router.use('/callbacks', cb);

export { router as winnsenRouter };
