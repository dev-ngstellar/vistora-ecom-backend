import { OrderStatus, Prisma, ReviewStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ReportRepository extends BaseRepository<any, any> {
  protected readonly model: any;

  constructor() {
    super();
    this.model = this.prisma.order;
  }

  // ==================== SALES REPORT ====================
  public async getSalesReport(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discount: true,
        tax: true,
        shipping: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total), 0);
    const grossSales = orders.reduce((acc, o) => acc + Number(o.subtotal), 0);
    const totalDiscount = orders.reduce((acc, o) => acc + Number(o.discount), 0);
    const netSales = grossSales - totalDiscount;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Daily Sales breakdown
    const dailySalesMap = new Map<string, { revenue: number; ordersCount: number }>();
    orders.forEach((o) => {
      const dayStr = o.createdAt.toISOString().split('T')[0] || '';
      const existing = dailySalesMap.get(dayStr) || { revenue: 0, ordersCount: 0 };
      dailySalesMap.set(dayStr, {
        revenue: existing.revenue + Number(o.total),
        ordersCount: existing.ordersCount + 1,
      });
    });

    const trend = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      ordersCount: data.ordersCount,
    }));

    return {
      totalRevenue,
      grossSales,
      totalDiscount,
      netSales,
      averageOrderValue,
      totalOrders: orders.length,
      trend,
    };
  }

  // ==================== ORDER REPORT ====================
  public async getOrderReport(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalOrders, completed, pending, cancelled, returned, paymentStats] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.RETURNED } }),
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    return {
      totalOrders,
      completed,
      pending,
      cancelled,
      returned,
      statusBreakdown: [
        { name: 'Delivered', count: completed, color: '#10B981' },
        { name: 'Pending', count: pending, color: '#F59E0B' },
        { name: 'Cancelled', count: cancelled, color: '#EF4444' },
        { name: 'Returned', count: returned, color: '#8B5CF6' },
      ],
      paymentStatus: paymentStats.map((p: any) => ({
        status: p.status,
        count: p._count._all,
      })),
    };
  }

  // ==================== PRODUCT REPORT ====================
  public async getProductReport() {
    const [topProducts, lowStockInventories, categorySales, brandSales] = await Promise.all([
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.inventory.findMany({
        where: { availableStock: { lte: 5 } },
        select: {
          id: true,
          sku: true,
          availableStock: true,
          product: {
            select: { id: true, name: true, price: true },
          },
        },
        take: 10,
      }),
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
      }),
      this.prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    const bestSelling = topProducts.map((p) => ({
      productId: p.productId,
      name: p.productName,
      quantitySold: p._sum.quantity || 0,
      revenueGenerated: p._sum.total || 0,
    }));

    const lowStockProducts = lowStockInventories.map((inv) => ({
      id: inv.id,
      name: inv.product?.name || 'Product',
      sku: inv.sku,
      stock: inv.availableStock,
      price: inv.product?.price ? Number(inv.product.price) : 0,
    }));

    return {
      bestSelling,
      lowStockProducts,
      outOfStockCount: lowStockProducts.filter((p) => p.stock === 0).length,
      lowStockCount: lowStockProducts.length,
      categoryDistribution: categorySales.map((c) => ({ name: c.name, count: c._count.products })),
      brandDistribution: brandSales.map((b) => ({ name: b.name, count: b._count.products })),
    };
  }

  // ==================== CUSTOMER REPORT ====================
  public async getCustomerReport() {
    const [totalCustomers, activeCustomers, repeatCustomers, topSpendCustomers] = await Promise.all([
      this.prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
      this.prisma.user.count({ where: { role: { name: 'CUSTOMER' }, status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: {
          role: { name: 'CUSTOMER' },
          orders: { some: {} },
        },
      }),
      this.prisma.order.groupBy({
        by: ['userId'],
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
    ]);

    const topCustomerDetails = await Promise.all(
      topSpendCustomers.map(async (item) => {
        const u = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { id: true, fullName: true, email: true },
        });
        return {
          id: u?.id || item.userId,
          name: u?.fullName || 'Customer',
          email: u?.email || '',
          totalSpent: item._sum.total ? Number(item._sum.total) : 0,
          ordersCount: item._count._all || 0,
        };
      })
    );

    return {
      totalCustomers,
      activeCustomers,
      repeatCustomers,
      topCustomers: topCustomerDetails,
    };
  }

  // ==================== INVENTORY REPORT ====================
  public async getInventoryReport() {
    const inventories = await this.prisma.inventory.findMany({
      select: {
        id: true,
        sku: true,
        availableStock: true,
        minimumStock: true,
        product: {
          select: { id: true, name: true, price: true },
        },
      },
    });

    const totalStockUnits = inventories.reduce((acc, inv) => acc + inv.availableStock, 0);
    const totalInventoryValue = inventories.reduce(
      (acc, inv) => acc + inv.availableStock * (inv.product?.price ? Number(inv.product.price) : 0),
      0
    );
    const restockAlerts = inventories
      .filter((inv) => inv.availableStock <= inv.minimumStock)
      .map((inv) => ({
        id: inv.id,
        name: inv.product?.name || 'Product',
        sku: inv.sku,
        stock: inv.availableStock,
        price: inv.product?.price ? Number(inv.product.price) : 0,
      }));

    return {
      totalStockUnits,
      totalInventoryValue,
      totalSkus: inventories.length,
      restockAlerts,
    };
  }

  // ==================== COUPON REPORT ====================
  public async getCouponReport() {
    const coupons = await this.prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        usedCount: true,
        usageLimit: true,
        status: true,
      },
      orderBy: { usedCount: 'desc' },
    });

    const totalRedemptions = coupons.reduce((acc, c) => acc + c.usedCount, 0);

    return {
      totalCoupons: coupons.length,
      totalRedemptions,
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.type,
        discountValue: Number(c.value),
        usageCount: c.usedCount,
        usageLimit: c.usageLimit,
        isActive: c.status === 'ACTIVE',
      })),
    };
  }

  // ==================== REVIEW REPORT ====================
  public async getReviewReport() {
    const [totalReviews, approvedCount, pendingCount, avgRatingResult, ratingGroups] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.count({ where: { status: ReviewStatus.APPROVED } }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        _count: { _all: true },
      }),
    ]);

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
      const found = ratingGroups.find((g) => g.rating === star);
      return {
        stars: `${star} Star`,
        count: found ? found._count._all : 0,
      };
    });

    return {
      totalReviews,
      approvedCount,
      pendingCount,
      averageRating: avgRatingResult._avg.rating || 5.0,
      ratingDistribution,
    };
  }
}
