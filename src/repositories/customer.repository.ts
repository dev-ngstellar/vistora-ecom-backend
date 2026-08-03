import { AccountStatus, Prisma, User, UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CustomerQueryFilters {
  search?: string;
  status?: AccountStatus;
  page?: number;
  limit?: number;
}

export class CustomerRepository extends BaseRepository<User, Prisma.UserDelegate> {
  protected readonly model: Prisma.UserDelegate;

  constructor() {
    super();
    this.model = this.prisma.user;
  }

  public async findCustomers(filters: CustomerQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const customerRole = await this.prisma.role.findUnique({
      where: { name: UserRole.CUSTOMER },
    });

    const where: Prisma.UserWhereInput = {
      ...(customerRole ? { roleId: customerRole.id } : {}),
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const customersWithMetrics = users.map((user) => {
      const validOrders = user.orders.filter((o) => o.status !== 'CANCELLED');
      const totalSpending = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrders = user.orders.length;
      const lastOrder = user.orders[0]?.createdAt || null;

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        totalOrders,
        totalSpending,
        lastOrderDate: lastOrder,
        defaultAddress: user.addresses[0] || null,
      };
    });

    return {
      customers: customersWithMetrics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findCustomerDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { take: 1 },
                  },
                },
              },
            },
            payments: true,
            shipment: true,
          },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { take: 1 },
                  },
                },
              },
            },
          },
        },
        auditLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return null;

    const validOrders = user.orders.filter((o) => o.status !== 'CANCELLED');
    const totalSpending = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrders = user.orders.length;
    const lastOrderDate = user.orders[0]?.createdAt || null;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        totalOrders,
        totalSpending,
        lastOrderDate,
        wishlistItemsCount: user.wishlist?.items.length || 0,
        addressCount: user.addresses.length,
      },
      addresses: user.addresses,
      orders: user.orders,
      wishlist: user.wishlist?.items || [],
      activityLog: user.auditLogs,
    };
  }

  public async updateCustomerStatus(id: string, status: AccountStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  public async getCustomerStats() {
    const customerRole = await this.prisma.role.findUnique({
      where: { name: UserRole.CUSTOMER },
    });

    const where: Prisma.UserWhereInput = customerRole ? { roleId: customerRole.id } : {};

    const [totalCustomers, activeCustomers, suspendedCustomers, revenueAgg] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, status: AccountStatus.ACTIVE } }),
      this.prisma.user.count({ where: { ...where, status: AccountStatus.SUSPENDED } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      totalCustomerSpending: Number(revenueAgg._sum.total || 0),
    };
  }
}
