import { NotificationStatus, NotificationType, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma.config';
import { logger } from '../../config/logger.config';
import {
  NotificationCountResponse,
  NotificationListResponse,
} from './notification.types';

export class NotificationService {
  /**
   * Get list of real notifications for the authenticated user
   */
  public async getNotifications(userId: string, limit = 20): Promise<NotificationListResponse> {
    let [notifications, unreadCount, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, status: NotificationStatus.UNREAD },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    // If staff user has 0 notifications yet, populate recent store orders as initial real notifications
    if (notifications.length === 0) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: { select: { name: true } } },
        });

        if (user && ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]).includes(user.role.name)) {
          const recentOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
          });

          if (recentOrders.length > 0) {
            await prisma.notification.createMany({
              data: recentOrders.map((o) => {
                const cust = o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() || o.user.email : 'Customer';
                return {
                  userId,
                  type: NotificationType.ORDER,
                  title: 'New Customer Order Placed',
                  message: `Order #${o.orderNumber} placed by ${cust} (₹${Number(o.total).toFixed(2)})`,
                  actionUrl: `/admin/orders/${o.id}`,
                  status: NotificationStatus.UNREAD,
                  createdAt: o.createdAt,
                };
              }),
            });

            notifications = await prisma.notification.findMany({
              where: { userId },
              orderBy: { createdAt: 'desc' },
              take: limit,
            });
            unreadCount = notifications.filter((n) => n.status === NotificationStatus.UNREAD).length;
            totalCount = notifications.length;
          }
        }
      } catch (err) {
        logger.error({ err }, 'Failed to backfill initial notifications');
      }
    }

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        status: n.status,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
      unreadCount,
      totalCount,
    };
  }

  /**
   * Get notification counts grouped by categories
   */
  public async getNotificationCount(userId: string): Promise<NotificationCountResponse> {
    const [unreadCount, totalCount, orderCount, systemCount, paymentCount] = await Promise.all([
      prisma.notification.count({
        where: { userId, status: NotificationStatus.UNREAD },
      }),
      prisma.notification.count({
        where: { userId },
      }),
      prisma.notification.count({
        where: { userId, type: NotificationType.ORDER, status: NotificationStatus.UNREAD },
      }),
      prisma.notification.count({
        where: { userId, type: NotificationType.SYSTEM, status: NotificationStatus.UNREAD },
      }),
      prisma.notification.count({
        where: { userId, type: NotificationType.PAYMENT, status: NotificationStatus.UNREAD },
      }),
    ]);

    return {
      unreadCount,
      totalCount,
      categories: {
        order: orderCount + paymentCount,
        inventory: 0,
        customer: 0,
        system: systemCount,
      },
    };
  }

  /**
   * Mark a single notification as read
   */
  public async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all unread notifications for a user as read
   */
  public async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, status: NotificationStatus.UNREAD },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Dispatch notification to all admin/staff users when a customer places an order
   */
  public async createOrderNotification(order: { id: string; orderNumber: string; total: any; userId?: string }, customerName?: string) {
    try {
      let resolvedCustomerName = customerName;
      if (!resolvedCustomerName && order.userId) {
        const customer = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { firstName: true, lastName: true, email: true },
        });
        if (customer) {
          resolvedCustomerName = `${customer.firstName} ${customer.lastName}`.trim() || customer.email;
        }
      }

      const adminUsers = await prisma.user.findMany({
        where: {
          role: { name: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER] } },
        },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        await prisma.notification.createMany({
          data: adminUsers.map((admin) => ({
            userId: admin.id,
            type: NotificationType.ORDER,
            title: 'New Customer Order Placed',
            message: `Order #${order.orderNumber} placed by ${resolvedCustomerName || 'Customer'} (₹${Number(order.total).toFixed(2)})`,
            actionUrl: `/admin/orders/${order.id}`,
            status: NotificationStatus.UNREAD,
          })),
        });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to dispatch order notification');
    }
  }

  /**
   * Dispatch notification when payment is verified
   */
  public async createPaymentNotification(order: { id: string; orderNumber: string; total: any }) {
    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          role: { name: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER] } },
        },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        await prisma.notification.createMany({
          data: adminUsers.map((admin) => ({
            userId: admin.id,
            type: NotificationType.PAYMENT,
            title: 'Payment Verified & Captured',
            message: `Payment of ₹${Number(order.total).toFixed(2)} captured for Order #${order.orderNumber}`,
            actionUrl: `/admin/orders/${order.id}`,
            status: NotificationStatus.UNREAD,
          })),
        });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to dispatch payment notification');
    }
  }
}
