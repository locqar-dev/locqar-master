import { LockerStatus, LockerSize } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { success } from '../../shared/utils/response';
import { events } from '../../shared/events/eventBus';

export class LockersService {
  static async list(terminalId?: string) {
    const lockers = await prisma.locker.findMany({
      where: terminalId ? { terminalId } : {},
      orderBy: [{ terminalId: 'asc' }, { size: 'asc' }],
      include: {
        terminal: { select: { id: true, name: true, code: true } },
        currentPackage: { select: { waybill: true, status: true, recipientName: true } },
      },
    });
    return lockers;
  }

  static async getById(id: string) {
    const locker = await prisma.locker.findUnique({
      where: { id },
      include: {
        terminal: true,
        currentPackage: { include: { courier: { include: { user: { select: { name: true, phone: true } } } } } },
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!locker) throw new NotFoundError('Locker not found');
    return locker;
  }

  /** Get availability summary grouped by terminal */
  static async availability(terminalId?: string) {
    const lockers = await prisma.locker.findMany({
      where: { isActive: true, ...(terminalId ? { terminalId } : {}) },
      select: { terminalId: true, size: true, status: true },
    });

    const grouped: Record<string, Record<string, { available: number; total: number }>> = {};
    for (const l of lockers) {
      if (!grouped[l.terminalId]) grouped[l.terminalId] = {};
      if (!grouped[l.terminalId][l.size]) grouped[l.terminalId][l.size] = { available: 0, total: 0 };
      grouped[l.terminalId][l.size].total++;
      if (l.status === 'available') grouped[l.terminalId][l.size].available++;
    }
    return grouped;
  }

  /** Find an available locker for a given size at terminal */
  static async findAvailable(terminalId: string, size: LockerSize) {
    const locker = await prisma.locker.findFirst({
      where: { terminalId, size, status: 'available', isActive: true },
    });
    if (!locker) throw new BadRequestError(`No available ${size} locker at this terminal`);
    return locker;
  }

  /** Open locker door (triggers Winnsen API in production) */
  static async open(id: string, triggeredBy: string) {
    const locker = await prisma.locker.findUniqueOrThrow({ where: { id } });

    // In production: call Winnsen API to open door
    // await winnsenApi.openDoor(locker.winnsenSn, locker.doorNo);

    await prisma.lockerEvent.create({
      data: { lockerId: id, eventType: 'door_opened', triggeredBy },
    });

    events.lockerDoor({ lockerId: id, terminalId: locker.terminalId, eventType: 'door_opened', doorNo: locker.doorNo ?? undefined });

    return { message: 'Locker door opened', lockerId: id, compartmentNo: locker.compartmentNo };
  }

  static async updateStatus(id: string, status: LockerStatus) {
    return prisma.locker.update({ where: { id }, data: { status } });
  }
}
