import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // User Management
  async getAllUsers(filters?: { role?: string; isActive?: boolean; limit?: number; offset?: number }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return this.prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, newRole: string, adminId: string) {
    // Validate role
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'];
    if (!validRoles.includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    const oldUser = await this.prisma.user.findUnique({ where: { id: userId } });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: 'UPDATE_USER_ROLE',
      entityType: 'User',
      entityId: userId,
      oldValues: { role: oldUser.role },
      newValues: { role: newRole },
    });

    return updatedUser;
  }

  async toggleUserStatus(userId: string, isActive: boolean, adminId: string) {
    const oldUser = await this.prisma.user.findUnique({ where: { id: userId } });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityType: 'User',
      entityId: userId,
      oldValues: { isActive: oldUser.isActive },
      newValues: { isActive },
    });

    return updatedUser;
  }

  async resetUserPassword(userId: string, tempPassword: string, adminId: string) {
    const hashedPassword = await import('bcrypt').then(m =>
      m.hash(tempPassword, 10),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: 'RESET_USER_PASSWORD',
      entityType: 'User',
      entityId: userId,
    });

    return { success: true, tempPassword };
  }

  // Terminal Management
  async getAllTerminals(filters?: { status?: string; limit?: number; offset?: number }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return this.prisma.terminal.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        _count: {
          select: { lockers: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTerminalDetails(terminalId: string) {
    return this.prisma.terminal.findUnique({
      where: { id: terminalId },
      include: {
        lockers: {
          select: {
            id: true,
            displayId: true,
            status: true,
            size: true,
          },
        },
      },
    });
  }

  async updateTerminalStatus(terminalId: string, status: string, adminId: string) {
    const validStatuses = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const oldTerminal = await this.prisma.terminal.findUnique({
      where: { id: terminalId },
    });

    const updatedTerminal = await this.prisma.terminal.update({
      where: { id: terminalId },
      data: { status },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: 'UPDATE_TERMINAL_STATUS',
      entityType: 'Terminal',
      entityId: terminalId,
      oldValues: { status: oldTerminal.status },
      newValues: { status },
    });

    return updatedTerminal;
  }

  // Package Management
  async getAllPackages(filters?: {
    status?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return this.prisma.package.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPackageDetails(packageId: string) {
    return this.prisma.package.findUnique({
      where: { id: packageId },
      include: {
        locker: true,
      },
    });
  }

  async updatePackageStatus(packageId: string, status: string, adminId: string) {
    const validStatuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED_TO_LOCKER', 'PICKED_UP', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const oldPackage = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    const updatedPackage = await this.prisma.package.update({
      where: { id: packageId },
      data: { status },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: 'UPDATE_PACKAGE_STATUS',
      entityType: 'Package',
      entityId: packageId,
      packageId,
      oldValues: { status: oldPackage.status },
      newValues: { status },
    });

    return updatedPackage;
  }

  async exportPackageData(filters?: { format?: string; startDate?: Date; endDate?: Date }) {
    const packages = await this.prisma.package.findMany({
      where: {
        createdAt: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
      },
    });

    if (filters?.format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Waybill', 'Status', 'Customer Name', 'Customer Phone', 'Created At'];
      const rows = packages.map(p => [
        p.id,
        p.waybill,
        p.status,
        p.customerName || '',
        p.customerPhone || '',
        p.createdAt,
      ]);
      return { headers, rows, format: 'csv' };
    }

    return packages;
  }

  // Compliance & Reporting
  async getComplianceData(startDate: Date, endDate: Date) {
    const [auditLogs, userActivity, dataAccess] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.session.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.complianceLog.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      auditLogCount: auditLogs.length,
      userActivityCount: userActivity.length,
      complianceActions: dataAccess.length,
      logs: {
        audit: auditLogs,
        compliance: dataAccess,
      },
    };
  }

  async deleteUserData(userId: string, adminId: string) {
    // Log compliance action
    await this.prisma.complianceLog.create({
      data: {
        type: 'ACCOUNT_DELETE',
        userId: adminId,
        description: `User account ${userId} data deleted per request`,
        status: 'COMPLETED',
      },
    });

    // Anonymize user data
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@locqar.local`,
        name: 'Deleted User',
        password: 'deleted',
        phone: null,
        isActive: false,
      },
    });

    return { success: true };
  }

  // Role-Based Access Control Check
  async checkPermission(adminId: string, requiredRole: string): Promise<boolean> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) return false;

    const roleHierarchy = {
      SUPER_ADMIN: 4,
      ADMIN: 3,
      MANAGER: 2,
      AGENT: 1,
    };

    return (roleHierarchy[admin.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  }
}
