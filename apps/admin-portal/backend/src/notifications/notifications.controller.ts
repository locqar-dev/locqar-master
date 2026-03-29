import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.getNotifications(
      req.user.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: Request) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: Request) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  async getPreferences(@Req() req: Request) {
    return this.notificationsService.getNotificationPreferences(req.user.id);
  }

  @Post('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Req() req: Request, @Body() preferences: any) {
    return this.notificationsService.updateNotificationPreferences(req.user.id, preferences);
  }
}
