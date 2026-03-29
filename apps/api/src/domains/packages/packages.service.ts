import { PackageStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError';
import { generateWaybill } from '../../shared/utils/waybill';
import { parsePagination } from '../../shared/utils/pagination';
import { paginated, success } from '../../shared/utils/response';
import { events } from '../../shared/events/eventBus';
import { AuthUser } from '../../shared/types/express';
import type { Request } from 'express';
import type { CreatePackageDto, UpdateStatusDto, ScanDto } from './packages.validator';

// SLA hours by delivery method
const SLA_HOURS: Record<string, number> = {
  warehouse_to_locker: 24,
  dropbox_to_locker: 48,
  locker_to_home: 72,
};

export class PackagesService {
  /** List packages — scoped to terminal unless SUPER_ADMIN/ADMIN */
  static async list(user: AuthUser, req: Request) {
    const { page, pageSize, skip, take } = parsePagination(req);
    const q = req.query as Record<string, string>;

    const where: Prisma.PackageWhereInput = {};

    // Terminal scoping
    if (user.staffRole !== 'SUPER_ADMIN' && user.staffRole !== 'ADMIN') {
      where.terminalId = user.terminalId ?? undefined;
    } else if (q.terminalId) {
      where.terminalId = q.terminalId;
    }

    if (q.status) where.status = q.status as PackageStatus;
    if (q.courierId) where.courierId = q.courierId;
    if (q.search) {
      where.OR = [
        { waybill: { contains: q.search, mode: 'insensitive' } },
        { recipientName: { contains: q.search, mode: 'insensitive' } },
        { recipientPhone: { contains: q.search, mode: 'insensitive' } },
        { senderName: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.from) where.createdAt = { ...(where.createdAt as object), gte: new Date(q.from) };
    if (q.to) where.createdAt = { ...(where.createdAt as object), lte: new Date(q.to) };

    const [data, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          courier: { include: { user: { select: { name: true } } } },
          locker: { select: { id: true, name: true, serialNo: true, size: true } },
          terminal: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.package.count({ where }),
    ]);

    return paginated(data, total, page, pageSize);
  }

  /** Get single package by waybill */
  static async getByWaybill(waybill: string, user: AuthUser) {
    const pkg = await prisma.package.findUnique({
      where: { waybill },
      include: {
        timeline: { orderBy: { createdAt: 'desc' } },
        courier: { include: { user: { select: { name: true, phone: true } } } },
        locker: true,
        terminal: true,
        proofOfDelivery: true,
        exceptions: true,
        tasks: { include: { courier: { include: { user: { select: { name: true } } } } } },
      },
    });

    if (!pkg) throw new NotFoundError(`Package ${waybill} not found`);

    // Terminal scope check
    if (user.staffRole !== 'SUPER_ADMIN' && user.staffRole !== 'ADMIN') {
      if (pkg.terminalId !== user.terminalId) throw new ForbiddenError();
    }

    return pkg;
  }

  /** Create new package */
  static async create(dto: CreatePackageDto, user: AuthUser) {
    const waybill = await generateWaybill();
    const slaDeadline = new Date(Date.now() + SLA_HOURS[dto.deliveryMethod] * 3600000);

    const pkg = await prisma.package.create({
      data: {
        waybill,
        slaDeadline,
        ...dto,
        timeline: {
          create: {
            status: 'pending',
            description: 'Package created',
            actorId: user.id,
            actorName: user.name,
          },
        },
      },
      include: { terminal: true },
    });

    return pkg;
  }

  /** Update package status */
  static async updateStatus(waybill: string, dto: UpdateStatusDto, user: AuthUser) {
    const pkg = await prisma.package.findUniqueOrThrow({ where: { waybill } });

    const updated = await prisma.package.update({
      where: { waybill },
      data: {
        status: dto.status,
        courierId: dto.courierId ?? pkg.courierId,
        lockerId: dto.lockerId ?? pkg.lockerId,
        deliveredAt: dto.status === 'delivered_to_locker' || dto.status === 'delivered_to_home' ? new Date() : undefined,
        pickedUpAt: dto.status === 'picked_up' ? new Date() : undefined,
        timeline: {
          create: {
            status: dto.status,
            description: dto.notes ?? `Status updated to ${dto.status}`,
            actorId: user.id,
            actorName: user.name,
          },
        },
      },
    });

    // Emit event for notifications
    events.packageStatusChanged({
      waybill,
      packageId: pkg.id,
      newStatus: dto.status,
      customerId: pkg.customerId,
      terminalId: pkg.terminalId,
      courierId: dto.courierId ?? pkg.courierId,
      lockerId: dto.lockerId ?? pkg.lockerId,
    });

    return updated;
  }

  /** Assign courier to package */
  static async assign(waybill: string, courierId: string, user: AuthUser) {
    const [pkg, courier] = await Promise.all([
      prisma.package.findUnique({ where: { waybill } }),
      prisma.courier.findUnique({ where: { id: courierId } }),
    ]);

    if (!pkg) throw new NotFoundError(`Package ${waybill} not found`);
    if (!courier) throw new NotFoundError('Courier not found');

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.package.update({
        where: { waybill },
        data: {
          courierId,
          status: 'assigned',
          timeline: {
            create: {
              status: 'assigned',
              description: `Assigned to courier`,
              actorId: user.id,
              actorName: user.name,
            },
          },
        },
      });

      await tx.task.create({
        data: {
          courierId,
          packageId: pkg.id,
          status: 'assigned',
        },
      });

      return p;
    });

    events.taskAssigned({
      taskId: '',
      courierId,
      packageId: pkg.id,
      waybill,
    });

    return updated;
  }

  /** Courier scans package (barcode action) */
  static async scan(dto: ScanDto, user: AuthUser) {
    const pkg = await prisma.package.findUnique({ where: { waybill: dto.waybill } });
    if (!pkg) throw new NotFoundError(`Package ${dto.waybill} not found`);

    const statusMap: Record<string, PackageStatus> = {
      pickup: 'accepted',
      deposit: 'delivered_to_locker',
      recall: 'recalled',
    };

    const newStatus = statusMap[dto.action];
    if (!newStatus) throw new BadRequestError('Invalid scan action');

    return PackagesService.updateStatus(dto.waybill, { status: newStatus, lockerId: dto.lockerId }, user);
  }

  /** Get package tracking (public — by waybill + phone) */
  static async track(waybill: string, phone: string) {
    const pkg = await prisma.package.findUnique({
      where: { waybill },
      select: {
        waybill: true, status: true, deliveryMethod: true, size: true,
        recipientName: true, recipientPhone: true,
        slaDeadline: true, deliveredAt: true, pickedUpAt: true,
        terminal: { select: { name: true, city: true } },
        locker: { select: { name: true, location: true } },
        timeline: { select: { status: true, description: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!pkg) throw new NotFoundError(`Package ${waybill} not found`);

    // Verify recipient phone for privacy
    const normPhone = phone.replace(/\D/g, '');
    const normRecipient = pkg.recipientPhone.replace(/\D/g, '');
    if (!normRecipient.endsWith(normPhone.slice(-9))) {
      throw new ForbiddenError('Phone number does not match this package');
    }

    return pkg;
  }

  static async delete(waybill: string) {
    await prisma.package.findUniqueOrThrow({ where: { waybill } });
    await prisma.package.delete({ where: { waybill } });
  }
}
