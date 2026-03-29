import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationType = 'DELIVERY' | 'PAYMENT' | 'SECURITY' | 'PROMOTION' | 'SYSTEM';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    expiresAt?: Date,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        expiresAt,
      },
    });
  }

  async getNotifications(userId: string, limit: number = 50, offset: number = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async getNotificationPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<any>) {
    return this.prisma.notificationPreference.update({
      where: { userId },
      data: preferences,
    });
  }

  // Batch notification sending for events
  async sendDeliveryAlert(userId: string, packageInfo: any) {
    return this.sendNotification(
      userId,
      'DELIVERY',
      `Package ${packageInfo.waybill} is ready!`,
      `Your package is ready for pickup at ${packageInfo.location}`,
      { packageId: packageInfo.id, waybill: packageInfo.waybill },
    );
  }

  async sendPaymentAlert(userId: string, paymentInfo: any) {
    return this.sendNotification(
      userId,
      'PAYMENT',
      'Payment Confirmation',
      `Payment of GHS ${paymentInfo.amount} has been processed`,
      { transactionId: paymentInfo.transactionId },
    );
  }

  async sendSecurityAlert(userId: string, alertInfo: any) {
    return this.sendNotification(
      userId,
      'SECURITY',
      'Security Alert',
      `Unusual login activity detected on your account`,
      { location: alertInfo.ipAddress, timestamp: new Date() },
    );
  }

  async cleanupExpiredNotifications() {
    return this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }
}
