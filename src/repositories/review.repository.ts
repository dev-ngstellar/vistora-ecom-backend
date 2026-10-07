import { OrderStatus, Prisma, Review, ReviewStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface ReviewQueryFilters {
  search?: string;
  rating?: number;
  status?: ReviewStatus;
  productId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export class ReviewRepository extends BaseRepository<Review, Prisma.ReviewDelegate> {
  protected readonly model: Prisma.ReviewDelegate;

  constructor() {
    super();
    this.model = this.prisma.review;
  }

  public async findReviews(filters: ReviewQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              images: { take: 1 },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
          },
        },
      },
    });
  }

  public async updateStatus(id: string, status: ReviewStatus) {
    return this.prisma.review.update({
      where: { id },
      data: { status },
    });
  }

  public async deleteReview(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  public async getReviewStats() {
    const [totalReviews, pendingReviews, approvedReviews, rejectedReviews, ratingAgg] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.review.count({ where: { status: ReviewStatus.APPROVED } }),
      this.prisma.review.count({ where: { status: ReviewStatus.REJECTED } }),
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    return {
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      avgRating: Number((ratingAgg._avg.rating || 0).toFixed(1)),
    };
  }

  public async createReview(data: {
    productId: string;
    userId: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    orderId?: string | null;
    status?: ReviewStatus;
  }) {
    return this.prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        orderId: data.orderId,
        status: data.status || ReviewStatus.APPROVED,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  public async findProductReviews(
    productId: string,
    filters: {
      page?: number;
      limit?: number;
      rating?: number;
      sort?: string;
    }
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      productId,
      status: ReviewStatus.APPROVED,
    };

    if (filters.rating && filters.rating >= 1 && filters.rating <= 5) {
      where.rating = filters.rating;
    }

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sort === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (filters.sort === 'lowest') {
      orderBy = { rating: 'asc' };
    } else if (filters.sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fullName: true,
              avatar: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      ...r,
      isVerifiedBuyer: Boolean(r.orderId),
    }));

    return {
      reviews: formattedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getProductReviewSummary(productId: string) {
    const approvedWhere: Prisma.ReviewWhereInput = {
      productId,
      status: ReviewStatus.APPROVED,
    };

    const [totalCount, avgResult, distributionGroups] = await Promise.all([
      this.prisma.review.count({ where: approvedWhere }),
      this.prisma.review.aggregate({
        where: approvedWhere,
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: approvedWhere,
        _count: { _all: true },
      }),
    ]);

    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distributionGroups.forEach((g) => {
      if (g.rating >= 1 && g.rating <= 5) {
        distribution[g.rating] = g._count._all;
      }
    });

    const percentages: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (totalCount > 0) {
      for (let star = 1; star <= 5; star++) {
        percentages[star] = Math.round(((distribution[star] || 0) / totalCount) * 100);
      }
    }

    const highRatingsCount = (distribution[4] || 0) + (distribution[5] || 0);
    const recommendedPercentage =
      totalCount > 0 ? Math.round((highRatingsCount / totalCount) * 100) : 100;

    return {
      totalReviews: totalCount,
      averageRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      distribution,
      percentages,
      recommendedPercentage,
    };
  }

  public async findUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  public async findUserProductReview(userId: string, productId: string) {
    return this.prisma.review.findFirst({
      where: { userId, productId },
    });
  }

  public async findUserOrderForProduct(userId: string, productId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: [
              OrderStatus.DELIVERED,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.PACKED,
              OrderStatus.SHIPPED,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
      },
      select: { orderId: true },
    });
    return item?.orderId || null;
  }

  public async deleteUserReview(id: string, userId: string) {
    return this.prisma.review.deleteMany({
      where: { id, userId },
    });
  }
}
