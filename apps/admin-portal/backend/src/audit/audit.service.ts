import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  packageId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        packageId: input.packageId,
        oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newValues: input.newValues ? JSON.stringify(input.newValues) : null,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status || 'SUCCESS',
        errorMessage: input.errorMessage,
      },
    });
  }

  async getLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return this.prisma.auditLog.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.action && { action: filters.action }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.startDate && {
          createdAt: {
            gte: filters.startDate,
          },
        }),
        ...(filters?.endDate && {
          createdAt: {
            lte: filters.endDate,
          },
        }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getAuditTrail(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChanges(entityType: string, entityId: string, action: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
        action,
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (logs.length >= 2) {
      return {
        before: logs[1].oldValues ? JSON.parse(logs[1].oldValues) : null,
        after: logs[0].newValues ? JSON.parse(logs[0].newValues) : null,
      };
    } else if (logs.length === 1) {
      return {
        before: null,
        after: logs[0].newValues ? JSON.parse(logs[0].newValues) : null,
      };
    }
    return null;
  }

  async getComplianceReport(startDate: Date, endDate: Date) {
    return this.prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });
  }
}
