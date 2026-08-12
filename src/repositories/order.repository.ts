import { Order, OrderStatus, PaymentStatus, Prisma, ShipmentStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface OrderQueryFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export class OrderRepository extends BaseRepository<Order, Prisma.OrderDelegate> {
  protected readonly model: Prisma.OrderDelegate;

  constructor() {
    super();
    this.model = this.prisma.order;
  }

  public async findOrders(filters: OrderQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.paymentStatus) {
      where.payments = {
        some: {
          status: filters.paymentStatus,
        },
      };
    }

    if (filters.shipmentStatus) {
      where.shipment = {
        shipmentStatus: filters.shipmentStatus,
      };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          address: true,
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                  },
                  brand: true,
                  category: true,
                },
              },
              variant: true,
            },
          },
          payments: true,
          shipment: true,
          invoice: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              },
            },
            variant: true,
          },
        },
        payments: true,
        shipment: true,
        invoice: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        couponUsages: {
          include: {
            coupon: true,
          },
        },
      },
    });
  }

  public async updateOrderStatus(id: string, status: OrderStatus, remarks?: string, updatedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          remarks: remarks || `Order status updated to ${status}`,
          updatedBy: updatedBy || 'System Admin',
        },
      });

      // Synchronize shipment status if applicable
      if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
        const shipmentStatus = status === OrderStatus.SHIPPED ? ShipmentStatus.SHIPPED : ShipmentStatus.DELIVERED;
        await tx.shipment.upsert({
          where: { orderId: id },
          update: {
            shipmentStatus,
            ...(status === OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
            ...(status === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
          },
          create: {
            orderId: id,
            shipmentStatus,
            courierName: 'Vistora Express Logistics',
            trackingNumber: `VSTR-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
            ...(status === OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
            ...(status === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
          },
        });
      }

      return order;
    });
  }

  public async cancelOrder(id: string, reason?: string, updatedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED, notes: reason ? `Cancelled: ${reason}` : 'Cancelled by staff' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          remarks: reason || 'Order cancelled',
          updatedBy: updatedBy || 'System Admin',
        },
      });

      return order;
    });
  }

  public async ensureInvoice(orderId: string) {
    const existing = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: true,
            payments: true,
          },
        },
      },
    });

    if (existing) return existing;

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const invoiceNumber = `INV-${order.orderNumber}`;
    return this.prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
      },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: true,
            payments: true,
          },
        },
      },
    });
  }

  public async getOrderStats() {
    const [totalOrders, pendingOrders, completedOrders, cancelledOrders, revenueAgg] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(revenueAgg._sum.total || 0),
    };
  }
}
