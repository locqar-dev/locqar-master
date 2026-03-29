import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';

const router = Router();
router.use(authenticate, authorize('analytics.view'));

/** Dashboard summary stats */
router.get('/summary', async (req, res, next) => {
  try {
    const terminalId = req.user!.staffRole === 'SUPER_ADMIN' ? undefined : req.user!.terminalId ?? undefined;
    const packageWhere = terminalId ? { terminalId } : {};

    const [
      totalPackages,
      packagesByStatus,
      totalCouriers,
      totalLockers,
      availableLockers,
      recentPackages,
    ] = await Promise.all([
      prisma.package.count({ where: packageWhere }),
      prisma.package.groupBy({ by: ['status'], where: packageWhere, _count: true }),
      prisma.courier.count({ where: terminalId ? { terminalId } : {} }),
      prisma.locker.count({ where: terminalId ? { terminalId } : {} }),
      prisma.locker.count({ where: { status: 'available', ...(terminalId ? { terminalId } : {}) } }),
      prisma.package.findMany({
        where: packageWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { waybill: true, status: true, recipientName: true, createdAt: true },
      }),
    ]);

    const statusMap = packagesByStatus.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count;
      return acc;
    }, {});

    res.json(success({
      packages: { total: totalPackages, byStatus: statusMap },
      couriers: { total: totalCouriers },
      lockers: { total: totalLockers, available: availableLockers, occupancy: totalLockers ? Math.round(((totalLockers - availableLockers) / totalLockers) * 100) : 0 },
      recentPackages,
    }));
  } catch (e) { next(e); }
});

/** Package throughput by day (last 30 days) */
router.get('/throughput', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;
    const from = new Date(Date.now() - days * 86400000);
    const terminalId = req.user!.staffRole === 'SUPER_ADMIN' ? undefined : req.user!.terminalId ?? undefined;

    const packages = await prisma.package.findMany({
      where: { createdAt: { gte: from }, ...(terminalId ? { terminalId } : {}) },
      select: { createdAt: true, status: true },
    });

    // Group by day
    const byDay: Record<string, { created: number; delivered: number }> = {};
    for (const pkg of packages) {
      const day = pkg.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { created: 0, delivered: 0 };
      byDay[day].created++;
      if (pkg.status === 'delivered_to_locker' || pkg.status === 'delivered_to_home') {
        byDay[day].delivered++;
      }
    }

    res.json(success({ days: byDay }));
  } catch (e) { next(e); }
});

/** Courier leaderboard */
router.get('/couriers/leaderboard', async (req, res, next) => {
  try {
    const couriers = await prisma.courier.findMany({
      orderBy: { totalDeliveries: 'desc' },
      take: 20,
      include: { user: { select: { name: true, avatar: true } }, terminal: { select: { name: true } } },
    });
    res.json(success(couriers));
  } catch (e) { next(e); }
});

/** Terminal network overview */
router.get('/terminals', async (req, res, next) => {
  try {
    const terminals = await prisma.terminal.findMany({
      include: {
        _count: { select: { lockers: true, couriers: true, packages: true } },
        lockers: { where: { status: 'available' }, select: { id: true } },
      },
    });
    res.json(success(terminals));
  } catch (e) { next(e); }
});

export { router as analyticsRouter };
