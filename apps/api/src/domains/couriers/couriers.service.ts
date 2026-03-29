import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { parsePagination } from '../../shared/utils/pagination';
import { paginated } from '../../shared/utils/response';
import { AuthUser } from '../../shared/types/express';
import type { Request } from 'express';

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
}
