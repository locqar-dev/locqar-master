import { prisma } from '../config/database';
import { logger } from '../shared/utils/logger';
import { events } from '../shared/events/eventBus';

export async function expirePackagesJob() {
  const now = new Date();

  // Find packages that have been in locker past SLA deadline and haven't been picked up
  const expired = await prisma.package.findMany({
    where: {
      status: 'delivered_to_locker',
      expiresAt: { lte: now },
    },
    select: { id: true, waybill: true, terminalId: true, customerId: true, lockerId: true },
  });

  if (!expired.length) return;

  // Batch update to expired
  await prisma.package.updateMany({
    where: { id: { in: expired.map(p => p.id) } },
    data: { status: 'expired' },
  });

  // Timeline entries
  await prisma.packageTimeline.createMany({
    data: expired.map(p => ({
      packageId: p.id,
      status: 'expired' as any,
      description: 'Package expired — not picked up within SLA window',
    })),
  });

  // Free lockers
  const lockerIds = expired.map(p => p.lockerId).filter(Boolean) as string[];
  if (lockerIds.length) {
    await prisma.locker.updateMany({
      where: { id: { in: lockerIds } },
      data: { status: 'available', currentPackageId: null },
    });
  }

  // Notify
  for (const pkg of expired) {
    events.packageStatusChanged({
      waybill: pkg.waybill,
      packageId: pkg.id,
      newStatus: 'expired',
      customerId: pkg.customerId,
      terminalId: pkg.terminalId,
    });
  }

  logger.info(`Expired ${expired.length} packages`);
}
