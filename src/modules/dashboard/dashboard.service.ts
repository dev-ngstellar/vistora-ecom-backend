import { prisma } from '../../config/prisma.config';
import { DashboardSummaryResponse } from './dashboard.types';
import { OrderStatus, UserRole } from '@prisma/client';

export class DashboardService {
  public async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [
      orders,
      totalOrders,
      pendingOrders,
      totalCustomers,
      newCustomersToday,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      prisma.order.findMany({ select: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.user.count({ where: { role: { name: UserRole.CUSTOMER } } }),
      prisma.user.count({
        where: {
          role: { name: UserRole.CUSTOMER },
          createdAt: { gte: todayStart },
        },
      }),
      prisma.product.count(),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
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
