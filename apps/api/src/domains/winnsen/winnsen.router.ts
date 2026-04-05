/**
 * Locker Hardware Integration
 *
 * POST /api/winnsen/events — kiosk hardware calls us directly
 * Auth: x-api-key: WINNSEN_INBOUND_API_KEY
 * Body: { action, ...params }
 *
 * All door control is local via @locqar/door-controller (RS-485).
 * Winnsen cloud dependency has been fully removed.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { verifyPassword } from '../../shared/utils/crypto';
import { eventBus } from '../../shared/events/eventBus';
import { logger } from '../../shared/utils/logger';
import { lockerCloud } from '../../shared/services/locker-cloud.service';

const router = Router();

// ── Inbound API key auth ────────────────────────────────────────────────────

function requireInboundKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.winnsen.inboundApiKey) {
    res.status(401).json({ Status: 'Fail', Message: 'Unauthorized' });
    return;
  }
  next();
}

// ── Helper: find locker by serial number ────────────────────────────────────

async function lockerBySN(sn: string) {
  return prisma.locker.findFirst({ where: { winnsenSn: sn } });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/winnsen/events
// Kiosk touchscreen hardware → our server (direct local communication)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/events', requireInboundKey, async (req: Request, res: Response, next: NextFunction) => {
  const { action, ...body } = req.body as Record<string, string>;
  logger.info(`[Locker/events] action=${action}`, body);

  try {
    switch (action) {

      // ── Agent (courier) login at kiosk ──────────────────────────────────

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
        const { qrToken } = body;
        const courier = await prisma.courier.findFirst({ where: { qrCode: qrToken } });
        if (!courier) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid QR token' });
        }
        return res.json({ agentId: courier.id });
      }

      // ── Member (partner/customer) login at kiosk ────────────────────────

      case 'member-login-by-phone': {
        const { phone, password } = body;
        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user?.passwordHash || !await verifyPassword(password, user.passwordHash)) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid credentials' });
        }
        return res.json({ memberId: user.id });
      }

      case 'member-login-by-qr': {
        const { qrToken } = body;
        if (!qrToken) return res.status(400).json({ Status: 'Fail', Message: 'qrToken required' });
        const prefix = qrToken.slice(0, 8);
        const key = await prisma.partnerApiKey.findFirst({
          where: { keyPrefix: prefix, isActive: true },
        });
        if (!key) return res.status(401).json({ Status: 'Fail', Message: 'Invalid QR token' });
        return res.json({ memberId: key.customerId });
      }

      // ── Member package check ────────────────────────────────────────────

      case 'member-package': {
        const { memberId, lockerSN } = body;
        const locker = await lockerBySN(lockerSN);
        if (!locker) return res.json({ hasPackage: false });

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

      // ── Agent order operations ──────────────────────────────────────────

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

      // ── Physical locker events (door closed after drop/collect) ─────────

      case 'order-dropoff': {
        const { orderNumber, lockerSN, doorNum, owner } = body;
        const locker = await lockerBySN(lockerSN);
        if (!locker) return res.json({ Status: 'Fail', Message: 'Locker not found' });

        const newStatus = owner === 'agent'
          ? 'delivered_to_locker'
          : 'at_locker_pending_courier';

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
        logger.info(`[Locker] order-dropoff waybill=${orderNumber} door=${doorNum} sn=${lockerSN}`);
        return res.json({ Status: 'Success', Message: '' });
      }

      case 'order-collected': {
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
        logger.info(`[Locker] order-collected waybill=${orderNumber} owner=${owner} sn=${lockerSN}`);
        return res.json({ Status: 'Success', Message: '' });
      }

      // ── Payment at kiosk ────────────────────────────────────────────────

      case 'order-payment': {
        const { orderNumber } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          select: { isPaid: true },
        });
        return res.json({ hasPayment: pkg?.isPaid ?? false });
      }

      case 'generate-payment-page': {
        const { orderNumber } = body;
        const pkg = await prisma.package.findFirst({
          where: { waybill: orderNumber },
          select: { id: true, price: true },
        });
        if (!pkg) return res.json({ Status: 'Fail', Message: 'Order not found' });

        const expiredAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const url = `${config.urls.customer}/pay?order=${orderNumber}`;
        return res.json({ url, expiredAt, orderNumber });
      }

      // ── Door control (via lockerCloud service) ─────────────────────────

      case 'open-door': {
        const { doorNumber, lockerSN } = body;
        if (!doorNumber) {
          return res.status(400).json({ Status: 'Fail', Message: 'doorNumber required' });
        }
        const result = await lockerCloud.openDoor(Number(doorNumber));
        logger.info(`[Locker] open-door door=${doorNumber} success=${result.success}`);
        return res.json({
          Status: result.success ? 'Success' : 'Fail',
          Message: result.error || '',
          door: result.door,
        });
      }

      case 'door-status': {
        const { doorNumber: dn, station: st } = body;
        if (dn) {
          const result = await lockerCloud.getDoorStatus(Number(dn));
          return res.json({ Status: !result.error ? 'Success' : 'Fail', door: result.door, doorStatus: result.status });
        }
        if (st) {
          const result = await lockerCloud.getStationDoorStatus(Number(st));
          return res.json({ Status: !result.error ? 'Success' : 'Fail', doors: result.doors });
        }
        return res.status(400).json({ Status: 'Fail', Message: 'doorNumber or station required' });
      }

      // ── Verify pickup code + open door ──────────────────────────────────

      case 'verify-pickup-code': {
        const { code } = body;
        if (!code) {
          return res.status(400).json({ Status: 'Fail', Message: 'code required' });
        }
        const validation = await lockerCloud.validatePickupCode(code);
        if (!validation.valid) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid or expired code' });
        }
        if (!validation.doorNo) {
          return res.status(400).json({ Status: 'Fail', Message: 'No door assigned to this package' });
        }
        const openResult = await lockerCloud.openDoor(validation.doorNo);
        if (!openResult.success) {
          logger.error(`[Locker] Failed to open door ${validation.doorNo} for pickup code ${code}`);
          return res.status(500).json({ Status: 'Fail', Message: 'Door failed to open' });
        }
        logger.info(`[Locker] verify-pickup-code code=${code} waybill=${validation.waybill} door=${validation.doorNo}`);
        return res.json({
          Status: 'Success',
          waybill: validation.waybill,
          doorNumber: validation.doorNo,
          message: 'Door opened. Please collect your package.',
        });
      }

      // ── Generate pickup code ────────────────────────────────────────────

      case 'generate-pickup-code': {
        const { orderNumber: on, phone, terminalId } = body;
        if (!on) {
          return res.status(400).json({ Status: 'Fail', Message: 'orderNumber required' });
        }
        try {
          const result = await lockerCloud.generatePickupCode({
            waybill: on,
            phone: phone || undefined,
            terminalId: terminalId || undefined,
          });
          return res.json({ Status: 'Success', pickupCode: result.pickupCode, orderNumber: on, doorNo: result.doorNo });
        } catch (err: any) {
          return res.status(404).json({ Status: 'Fail', Message: err.message });
        }
      }

      // ── Terminal & locker info ──────────────────────────────────────────

      case 'terminal-list': {
        const terminals = await lockerCloud.getTerminalList();
        return res.json({ Status: 'Success', terminals });
      }

      case 'terminal-info': {
        const { terminalId: tid, lockerSN: sn, includeLiveStatus } = body;
        try {
          const doors = sn
            ? await lockerCloud.getTerminalInfoBySN(sn, includeLiveStatus === 'true')
            : tid
              ? await lockerCloud.getTerminalInfo(tid, includeLiveStatus === 'true')
              : null;
          if (!doors) {
            return res.status(400).json({ Status: 'Fail', Message: 'terminalId or lockerSN required' });
          }
          return res.json({ Status: 'Success', doors });
        } catch (err: any) {
          return res.status(404).json({ Status: 'Fail', Message: err.message });
        }
      }

      // ── Courier list ────────────────────────────────────────────────────

      case 'courier-list': {
        const { terminalId: ctid } = body;
        const couriers = await lockerCloud.getCourierList(ctid || undefined);
        return res.json({ Status: 'Success', couriers });
      }

      // ── Order queries ───────────────────────────────────────────────────

      case 'order-list': {
        const { startDate, endDate, terminalId: otid, status: ostatus } = body;
        if (!startDate || !endDate) {
          return res.status(400).json({ Status: 'Fail', Message: 'startDate and endDate required' });
        }
        const orders = await lockerCloud.getOrderList({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          terminalId: otid || undefined,
          status: ostatus || undefined,
        });
        return res.json({ Status: 'Success', orders });
      }

      case 'order-info': {
        const { orderNumber: oi } = body;
        if (!oi) {
          return res.status(400).json({ Status: 'Fail', Message: 'orderNumber required' });
        }
        const order = await lockerCloud.getOrderInfo(oi);
        if (!order) {
          return res.status(404).json({ Status: 'Fail', Message: 'Order not found' });
        }
        return res.json({ Status: 'Success', order });
      }

      // ── Hardware errors ─────────────────────────────────────────────────

      case 'error-list': {
        const { startDate: esd, endDate: eed, terminalId: etid } = body;
        if (!esd || !eed) {
          return res.status(400).json({ Status: 'Fail', Message: 'startDate and endDate required' });
        }
        const errors = await lockerCloud.getErrorList({
          startDate: new Date(esd),
          endDate: new Date(eed),
          terminalId: etid || undefined,
        });
        return res.json({ Status: 'Success', errors });
      }

      case 'log-error': {
        const { lockerId: eid, eventType: eet, description: edesc } = body;
        if (!eid || !eet) {
          return res.status(400).json({ Status: 'Fail', Message: 'lockerId and eventType required' });
        }
        await lockerCloud.logError({ lockerId: eid, eventType: eet, description: edesc });
        return res.json({ Status: 'Success', Message: 'Error logged' });
      }

      // ── Health / heartbeat ──────────────────────────────────────────────

      case 'health': {
        const health = await lockerCloud.healthCheck();
        return res.json({ Status: 'Success', ...health });
      }

      case 'heartbeat': {
        const { terminalId: htid } = body;
        if (!htid) {
          return res.status(400).json({ Status: 'Fail', Message: 'terminalId required' });
        }
        await lockerCloud.heartbeat(htid);
        return res.json({ Status: 'Success', Message: 'Heartbeat received' });
      }

      default:
        return res.status(400).json({ Status: 'Fail', Message: `Unknown action: ${action}` });
    }
  } catch (err) {
    next(err);
  }
});

export { router as winnsenRouter };
