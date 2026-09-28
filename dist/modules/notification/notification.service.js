"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma_config_1 = require("../../config/prisma.config");
const logger_config_1 = require("../../config/logger.config");
class NotificationService {
    /**
     * Get list of real notifications for the authenticated user
     */
    async getNotifications(userId, limit = 20) {
        let [notifications, unreadCount, totalCount] = await Promise.all([
            prisma_config_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId, status: client_1.NotificationStatus.UNREAD },
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId },
            }),
        ]);
        // If staff user has 0 notifications yet, populate recent store orders as initial real notifications
        if (notifications.length === 0) {
            try {
                const user = await prisma_config_1.prisma.user.findUnique({
                    where: { id: userId },
                    select: { role: { select: { name: true } } },
                });
                if (user && [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER].includes(user.role.name)) {
                    const recentOrders = await prisma_config_1.prisma.order.findMany({
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        include: { user: { select: { firstName: true, lastName: true, email: true } } },
                    });
                    if (recentOrders.length > 0) {
                        await prisma_config_1.prisma.notification.createMany({
                            data: recentOrders.map((o) => {
                                const cust = o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() || o.user.email : 'Customer';
                                return {
                                    userId,
                                    type: client_1.NotificationType.ORDER,
                                    title: 'New Customer Order Placed',
                                    message: `Order #${o.orderNumber} placed by ${cust} (₹${Number(o.total).toFixed(2)})`,
                                    actionUrl: `/admin/orders/${o.id}`,
                                    status: client_1.NotificationStatus.UNREAD,
                                    createdAt: o.createdAt,
                                };
                            }),
                        });
                        notifications = await prisma_config_1.prisma.notification.findMany({
                            where: { userId },
                            orderBy: { createdAt: 'desc' },
                            take: limit,
                        });
                        unreadCount = notifications.filter((n) => n.status === client_1.NotificationStatus.UNREAD).length;
                        totalCount = notifications.length;
                    }
                }
            }
            catch (err) {
                logger_config_1.logger.error({ err }, 'Failed to backfill initial notifications');
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
    async getNotificationCount(userId) {
        const [unreadCount, totalCount, orderCount, systemCount, paymentCount] = await Promise.all([
            prisma_config_1.prisma.notification.count({
                where: { userId, status: client_1.NotificationStatus.UNREAD },
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId },
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId, type: client_1.NotificationType.ORDER, status: client_1.NotificationStatus.UNREAD },
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId, type: client_1.NotificationType.SYSTEM, status: client_1.NotificationStatus.UNREAD },
            }),
            prisma_config_1.prisma.notification.count({
                where: { userId, type: client_1.NotificationType.PAYMENT, status: client_1.NotificationStatus.UNREAD },
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
    async markAsRead(id, userId) {
        return prisma_config_1.prisma.notification.updateMany({
            where: { id, userId },
            data: {
                status: client_1.NotificationStatus.READ,
                readAt: new Date(),
            },
        });
    }
    /**
     * Mark all unread notifications for a user as read
     */
    async markAllAsRead(userId) {
        return prisma_config_1.prisma.notification.updateMany({
            where: { userId, status: client_1.NotificationStatus.UNREAD },
            data: {
                status: client_1.NotificationStatus.READ,
                readAt: new Date(),
            },
        });
    }
    /**
     * Dispatch notification to all admin/staff users when a customer places an order
     */
    async createOrderNotification(order, customerName) {
        try {
            let resolvedCustomerName = customerName;
            if (!resolvedCustomerName && order.userId) {
                const customer = await prisma_config_1.prisma.user.findUnique({
                    where: { id: order.userId },
                    select: { firstName: true, lastName: true, email: true },
                });
                if (customer) {
                    resolvedCustomerName = `${customer.firstName} ${customer.lastName}`.trim() || customer.email;
                }
            }
            const adminUsers = await prisma_config_1.prisma.user.findMany({
                where: {
                    role: { name: { in: [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER] } },
                },
                select: { id: true },
            });
            if (adminUsers.length > 0) {
                await prisma_config_1.prisma.notification.createMany({
                    data: adminUsers.map((admin) => ({
                        userId: admin.id,
                        type: client_1.NotificationType.ORDER,
                        title: 'New Customer Order Placed',
                        message: `Order #${order.orderNumber} placed by ${resolvedCustomerName || 'Customer'} (₹${Number(order.total).toFixed(2)})`,
                        actionUrl: `/admin/orders/${order.id}`,
                        status: client_1.NotificationStatus.UNREAD,
                    })),
                });
            }
        }
        catch (error) {
            logger_config_1.logger.error({ error }, 'Failed to dispatch order notification');
        }
    }
    /**
     * Dispatch notification when payment is verified
     */
    async createPaymentNotification(order) {
        try {
            const adminUsers = await prisma_config_1.prisma.user.findMany({
                where: {
                    role: { name: { in: [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER] } },
                },
                select: { id: true },
            });
            if (adminUsers.length > 0) {
                await prisma_config_1.prisma.notification.createMany({
                    data: adminUsers.map((admin) => ({
                        userId: admin.id,
                        type: client_1.NotificationType.PAYMENT,
                        title: 'Payment Verified & Captured',
                        message: `Payment of ₹${Number(order.total).toFixed(2)} captured for Order #${order.orderNumber}`,
                        actionUrl: `/admin/orders/${order.id}`,
                        status: client_1.NotificationStatus.UNREAD,
                    })),
                });
            }
        }
        catch (error) {
            logger_config_1.logger.error({ error }, 'Failed to dispatch payment notification');
        }
    }
}
exports.NotificationService = NotificationService;
