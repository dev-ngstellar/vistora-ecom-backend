import { Prisma, Review, ReviewStatus } from '@prisma/client';
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
}
