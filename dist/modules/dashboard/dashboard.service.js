"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_config_1 = require("../../config/prisma.config");
const client_1 = require("@prisma/client");
class DashboardService {
    async getDashboardSummary() {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const [orders, totalOrders, pendingOrders, totalCustomers, newCustomersToday, totalProducts, lowStockCount,] = await Promise.all([
            prisma_config_1.prisma.order.findMany({ select: { total: true } }),
            prisma_config_1.prisma.order.count(),
            prisma_config_1.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            prisma_config_1.prisma.user.count({ where: { role: { name: client_1.UserRole.CUSTOMER } } }),
            prisma_config_1.prisma.user.count({
                where: {
                    role: { name: client_1.UserRole.CUSTOMER },
                    createdAt: { gte: todayStart },
                },
            }),
            prisma_config_1.prisma.product.count(),
            prisma_config_1.prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
        ]);
        const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
        return {
            totalSales,
            totalOrders,
            pendingOrders,
            totalCustomers,
            newCustomersToday,
            totalProducts,
            lowStockCount,
            currency: 'INR',
        };
    }
}
exports.DashboardService = DashboardService;
