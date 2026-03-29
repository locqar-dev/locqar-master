import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async recordDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already recorded for today
    const existing = await this.prisma.analytics.findFirst({
      where: {
        date: {
          gte: today,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Calculate metrics
    const packagesDelivered = await this.prisma.package.count({
      where: {
        status: 'PICKED_UP',
        createdAt: {
          gte: today,
        },
      },
    });

    const packagesPending = await this.prisma.package.count({
      where: {
        status: {
          in: ['PENDING', 'IN_TRANSIT'],
        },
      },
    });

    const activeUsers = await this.prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const terminalsOnline = await this.prisma.terminal.count({
      where: {
        status: 'ONLINE',
      },
    });

    return this.prisma.analytics.create({
      data: {
        date: today,
        packagesDelivered,
        packagesPending,
        activeUsers,
        newUsers,
        terminalsOnline,
      },
    });
  }

  async getMetrics(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {};

    return this.prisma.analytics.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getOverallStats() {
    const [
      totalPackages,
      deliveredPackages,
      pendingPackages,
      failedTransactions,
      totalTerminals,
      activeTerminals,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.prisma.package.count(),
      this.prisma.package.count({ where: { status: 'PICKED_UP' } }),
      this.prisma.package.count({
        where: { status: { in: ['PENDING', 'IN_TRANSIT'] } },
      }),
      this.prisma.auditLog.count({
        where: { status: 'FAILURE' },
      }),
      this.prisma.terminal.count(),
      this.prisma.terminal.count({ where: { status: 'ONLINE' } }),
      this.prisma.user.count(),
      this.prisma.session.count({
        where: { expiresAt: { gt: new Date() } },
      }),
    ]);

    return {
      totalPackages,
      deliveredPackages,
      pendingPackages,
      deliveryRate: totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0,
      failedTransactions,
      totalTerminals,
      activeTerminals,
      terminalUptime: totalTerminals > 0 ? (activeTerminals / totalTerminals) * 100 : 0,
      totalUsers,
      activeUsers,
    };
  }

  async getPackageAnalytics(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {};

    const statuses = await this.prisma.package.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const sizes = await this.prisma.locker.groupBy({
      by: ['size'],
      _count: true,
    });

    return {
      byStatus: statuses,
      bySize: sizes,
    };
  }

  async getTerminalAnalytics() {
    const terminals = await this.prisma.terminal.findMany({
      include: {
        _count: {
          select: { lockers: true },
        },
      },
    });

    const lockerStats = await this.prisma.locker.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      terminals,
      lockerStats,
    };
  }

  async getTimeSeries(metric: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      select: {
        date: true,
        [metric]: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async exportAnalyticsReport(startDate: Date, endDate: Date) {
    const data = await this.getMetrics({ startDate, endDate });
    const stats = await this.getOverallStats();
    const packageStats = await this.getPackageAnalytics({ startDate, endDate });
    const terminalStats = await this.getTerminalAnalytics();

    return {
      reportDate: new Date(),
      period: { startDate, endDate },
      overallStats: stats,
      dailyMetrics: data,
      packageAnalytics: packageStats,
      terminalAnalytics: terminalStats,
    };
  }
}
