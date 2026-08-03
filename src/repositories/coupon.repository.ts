import { Coupon, CouponStatus, CouponType, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CouponQueryFilters {
  search?: string;
  status?: CouponStatus;
  type?: CouponType;
  page?: number;
  limit?: number;
}

export class CouponRepository extends BaseRepository<Coupon, Prisma.CouponDelegate> {
  protected readonly model: Prisma.CouponDelegate;

  constructor() {
    super();
    this.model = this.prisma.coupon;
  }

  public async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });
  }

  public async findActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.prisma.coupon.findMany({
      where: {
        status: CouponStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAllCoupons(filters: CouponQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { usages: true },
          },
        },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      coupons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findCouponWithUsages(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { usedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
              },
            },
          },
        },
      },
    });
  }

  public async incrementUsage(id: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }

  public async getCouponStats() {
    const now = new Date();
    const [totalCoupons, activeCoupons, expiredCoupons, discountAgg] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.count({
        where: {
          status: CouponStatus.ACTIVE,
          endDate: { gte: now },
        },
      }),
      this.prisma.coupon.count({
        where: {
          OR: [{ status: CouponStatus.EXPIRED }, { endDate: { lt: now } }],
        },
      }),
      this.prisma.couponUsage.aggregate({
        _sum: { discount: true },
      }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalDiscountIssued: Number(discountAgg._sum.discount || 0),
    };
  }
}
