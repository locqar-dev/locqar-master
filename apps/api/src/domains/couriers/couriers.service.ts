import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError';
import { parsePagination } from '../../shared/utils/pagination';
import { paginated } from '../../shared/utils/response';
import { AuthUser } from '../../shared/types/express';
import type { Request } from 'express';
import type { CreateCourierDto, UpdateCourierDto } from './couriers.validation';

export class CouriersService {
  static async list(user: AuthUser, req: Request) {
    const { page, pageSize, skip, take } = parsePagination(req);
    const q = req.query as Record<string, string>;

    const where: Prisma.CourierWhereInput = {};
    if (user.staffRole !== 'SUPER_ADMIN' && user.staffRole !== 'ADMIN') {
      where.terminalId = user.terminalId ?? undefined;
    } else if (q.terminalId) {
      where.terminalId = q.terminalId;
    }
    if (q.status) where.status = q.status as any;
    if (q.search) {
      where.user = { OR: [
        { name: { contains: q.search, mode: 'insensitive' } },
        { phone: { contains: q.search, mode: 'insensitive' } },
      ]};
    }

    const [data, total] = await Promise.all([
      prisma.courier.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true, avatar: true } },
          terminal: { select: { id: true, name: true } },
          vehicle: { select: { plateNo: true, make: true, model: true } },
          _count: { select: { packages: true, tasks: true } },
        },
      }),
      prisma.courier.count({ where }),
    ]);

    return paginated(data, total, page, pageSize);
  }

  static async getById(id: string) {
    const courier = await prisma.courier.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar: true, createdAt: true } },
        terminal: true,
        vehicle: true,
        tasks: { take: 10, orderBy: { assignedAt: 'desc' }, include: { package: { select: { waybill: true, status: true } } } },
        shifts: { take: 10, orderBy: { date: 'desc' } },
        earnings: { take: 6, orderBy: { periodStart: 'desc' } },
      },
    });
    if (!courier) throw new NotFoundError('Courier not found');
    return courier;
  }

  static async getStats(courierId: string) {
    const [tasks, earnings] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { courierId },
        _count: true,
      }),
      prisma.earning.aggregate({
        where: { courierId },
        _sum: { totalAmount: true, deliveries: true },
      }),
    ]);

    return { tasks, totalEarnings: earnings._sum.totalAmount ?? 0, totalDeliveries: earnings._sum.deliveries ?? 0 };
  }

  static async updateStatus(id: string, status: string) {
    await prisma.courier.findUniqueOrThrow({ where: { id } });
    return prisma.courier.update({ where: { id }, data: { status: status as any } });
  }

  /** Create a new courier (User + Courier in a transaction) */
  static async create(data: CreateCourierDto) {
    // Check terminal exists
    const terminal = await prisma.terminal.findUnique({ where: { id: data.terminalId } });
    if (!terminal) throw new NotFoundError('Terminal not found');

    // Check phone uniqueness
    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) throw new ConflictError('A user with this phone number already exists');
    }

    // Check email uniqueness
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new ConflictError('A user with this email already exists');
    }

    // Auto-generate employeeId if not provided (format: COR-XXXX)
    const employeeId = data.employeeId || `COR-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Check employeeId uniqueness
    const existingEmpId = await prisma.courier.findUnique({ where: { employeeId } });
    if (existingEmpId) throw new ConflictError('Courier with this employeeId already exists');

    // Check cardNo uniqueness
    if (data.cardNo) {
      const existingCard = await prisma.courier.findUnique({ where: { cardNo: data.cardNo } });
      if (existingCard) throw new ConflictError('Courier with this cardNo already exists');
    }

    // Auto-generate qrCode
    const qrCode = randomUUID();

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          userType: 'COURIER',
          name: data.name,
          phone: data.phone,
          email: data.email,
          isActive: true,
        },
      });

      const courier = await tx.courier.create({
        data: {
          userId: user.id,
          terminalId: data.terminalId,
          employeeId,
          qrCode,
          cardNo: data.cardNo,
          team: data.team,
          vehicleId: data.vehicleId,
        },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          terminal: { select: { id: true, name: true } },
        },
      });

      return courier;
    });
  }

  /** Update courier fields (user + courier) */
  static async update(id: string, data: UpdateCourierDto) {
    const courier = await prisma.courier.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!courier) throw new NotFoundError('Courier not found');

    // Separate user fields from courier fields
    const { name, phone, email, ...courierFields } = data;
    const userData: Record<string, any> = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    if (email !== undefined) userData.email = email;

    return prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: courier.userId }, data: userData });
      }

      return tx.courier.update({
        where: { id },
        data: courierFields,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          terminal: { select: { id: true, name: true } },
        },
      });
    });
  }

  /** Soft-delete: set courier status=inactive AND user isActive=false */
  static async delete(id: string) {
    const courier = await prisma.courier.findUnique({ where: { id } });
    if (!courier) throw new NotFoundError('Courier not found');

    // Don't delete if courier has active tasks
    const activeTasks = await prisma.task.count({
      where: {
        courierId: id,
        status: { in: ['assigned', 'accepted', 'in_transit'] },
      },
    });
    if (activeTasks > 0) {
      throw new BadRequestError('Cannot delete courier with active tasks');
    }

    return prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: courier.userId }, data: { isActive: false } });
      return tx.courier.update({ where: { id }, data: { status: 'inactive' } });
    });
  }
}
