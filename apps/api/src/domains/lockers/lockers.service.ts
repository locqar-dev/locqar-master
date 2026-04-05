import { LockerStatus, LockerSize } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../shared/errors/AppError';
import { success } from '../../shared/utils/response';
import { events } from '../../shared/events/eventBus';
import { lockerCloud } from '../../shared/services/locker-cloud.service';
import type { CreateLockerDto, UpdateLockerDto, BulkCreateLockerDto } from './lockers.validation';

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

  /** Open locker door via local RS-485 door controller */
  static async open(id: string, triggeredBy: string) {
    const locker = await prisma.locker.findUniqueOrThrow({ where: { id } });

    if (!locker.doorNo) {
      throw new BadRequestError('Locker has no door number assigned');
    }

    // Open door via local RS-485 controller
    const result = await lockerCloud.openDoor(locker.doorNo);
    if (!result.success) {
      throw new BadRequestError(`Door failed to open: ${result.error}`);
    }

    await prisma.lockerEvent.create({
      data: { lockerId: id, eventType: 'door_opened', triggeredBy },
    });

    events.lockerDoor({ lockerId: id, terminalId: locker.terminalId, eventType: 'door_opened', doorNo: locker.doorNo ?? undefined });

    return { message: 'Locker door opened', lockerId: id, compartmentNo: locker.compartmentNo, doorNo: locker.doorNo };
  }

  static async updateStatus(id: string, status: LockerStatus) {
    return prisma.locker.update({ where: { id }, data: { status } });
  }

  /** Create a new locker */
  static async create(data: CreateLockerDto) {
    // Check terminal exists
    const terminal = await prisma.terminal.findUnique({ where: { id: data.terminalId } });
    if (!terminal) throw new NotFoundError('Terminal not found');

    // Check serialNo is unique
    const existing = await prisma.locker.findUnique({ where: { serialNo: data.serialNo } });
    if (existing) throw new ConflictError('Locker with this serialNo already exists');

    return prisma.locker.create({ data });
  }

  /** Update locker fields */
  static async update(id: string, data: UpdateLockerDto) {
    const locker = await prisma.locker.findUnique({ where: { id } });
    if (!locker) throw new NotFoundError('Locker not found');

    return prisma.locker.update({ where: { id }, data });
  }

  /** Soft-delete a locker (set isActive=false) */
  static async delete(id: string) {
    const locker = await prisma.locker.findUnique({ where: { id } });
    if (!locker) throw new NotFoundError('Locker not found');

    if (locker.currentPackageId) {
      throw new BadRequestError('Cannot delete locker that is currently occupied');
    }

    return prisma.locker.update({ where: { id }, data: { isActive: false } });
  }

  /** Bulk-create lockers for a terminal */
  static async bulkCreate(data: BulkCreateLockerDto) {
    const terminal = await prisma.terminal.findUnique({ where: { id: data.terminalId } });
    if (!terminal) throw new NotFoundError('Terminal not found');

    // Check all serialNos are unique
    const serialNos = data.lockers.map(l => l.serialNo);
    const existing = await prisma.locker.findMany({
      where: { serialNo: { in: serialNos } },
      select: { serialNo: true },
    });
    if (existing.length > 0) {
      throw new ConflictError(`Duplicate serialNo(s): ${existing.map(e => e.serialNo).join(', ')}`);
    }

    const created = await prisma.locker.createMany({
      data: data.lockers.map(l => ({ ...l, terminalId: data.terminalId })),
    });

    return { count: created.count };
  }

  /** Get all active pickup codes for a terminal (offline PIN cache) */
  static async getPinCache(terminalId: string) {
    const terminal = await prisma.terminal.findUnique({ where: { id: terminalId } });
    if (!terminal) throw new NotFoundError('Terminal not found');

    const packages = await prisma.package.findMany({
      where: {
        terminalId,
        status: 'delivered_to_locker',
        pickupCode: { not: null },
      },
      select: {
        id: true,
        pickupCode: true,
        lockerId: true,
        lockerDoorNo: true,
        waybill: true,
        recipientName: true,
        recipientPhone: true,
      },
    });

    return packages.map(p => ({
      pickupCode: p.pickupCode,
      lockerId: p.lockerId,
      lockerDoorNo: p.lockerDoorNo,
      packageId: p.id,
      waybill: p.waybill,
      recipientName: p.recipientName,
      recipientPhone: p.recipientPhone,
    }));
  }
}
