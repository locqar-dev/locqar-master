import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  private async checkAdmin(req: Request) {
    const hasPermission = await this.adminService.checkPermission(req.user.id, 'ADMIN');
    if (!hasPermission) {
      throw new ForbiddenException('Only administrators can access this resource');
    }
  }

  // User Management Endpoints
  @Get('users')
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllUsers({
      role,
      isActive: isActive === 'true',
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string, @Req() req: Request) {
    await this.checkAdmin(req);
    return this.adminService.getUserDetails(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.updateUserRole(id, body.role, req.user.id);
  }

  @Put('users/:id/status')
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.toggleUserStatus(id, body.isActive, req.user.id);
  }

  @Post('users/:id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { tempPassword: string },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.resetUserPassword(id, body.tempPassword, req.user.id);
  }

  // Terminal Management Endpoints
  @Get('terminals')
  async getAllTerminals(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllTerminals({
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('terminals/:id')
  async getTerminalDetails(@Param('id') id: string, @Req() req: Request) {
    await this.checkAdmin(req);
    return this.adminService.getTerminalDetails(id);
  }

  @Put('terminals/:id/status')
  async updateTerminalStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.updateTerminalStatus(id, body.status, req.user.id);
  }

  // Package Management Endpoints
  @Get('packages')
  async getAllPackages(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllPackages({
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('packages/:id')
  async getPackageDetails(@Param('id') id: string, @Req() req: Request) {
    await this.checkAdmin(req);
    return this.adminService.getPackageDetails(id);
  }

  @Put('packages/:id/status')
  async updatePackageStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.updatePackageStatus(id, body.status, req.user.id);
  }

  @Post('packages/export')
  async exportPackages(
    @Body() body: { format?: string; startDate?: string; endDate?: string },
    @Req() req: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.exportPackageData({
      format: body.format,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  // Compliance & Reporting
  @Get('compliance/report')
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req?: Request,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getComplianceData(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Delete('users/:id/data')
  async deleteUserData(@Param('id') id: string, @Req() req: Request) {
    await this.checkAdmin(req);
    return this.adminService.deleteUserData(id, req.user.id);
  }
}
