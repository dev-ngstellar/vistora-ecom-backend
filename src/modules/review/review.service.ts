import { ReviewStatus } from '@prisma/client';
import { ReviewQueryFilters, ReviewRepository } from '../../repositories/review.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { ApiError } from '../../utils/api-error.util';

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
}

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.productRepository = new ProductRepository();
  }

  public async getReviews(filters: ReviewQueryFilters) {
    return this.reviewRepository.findReviews(filters);
  }

  public async getReviewById(id: string) {
    const review = await this.reviewRepository.findReviewById(id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }
    return review;
  }

  public async updateStatus(id: string, status: ReviewStatus) {
    const existing = await this.reviewRepository.findReviewById(id);
    if (!existing) {
      throw ApiError.notFound('Review not found');
    }
    return this.reviewRepository.updateStatus(id, status);
  }

  public async deleteReview(id: string) {
    const existing = await this.reviewRepository.findReviewById(id);
    if (!existing) {
      throw ApiError.notFound('Review not found');
    }
    return this.reviewRepository.deleteReview(id);
  }

  public async getReviewStats() {
    return this.reviewRepository.getReviewStats();
  }

  public async createReview(userId: string, data: CreateReviewDto) {
    // 1. Verify product exists
    const product =
      (await this.productRepository.findByIdFull(data.productId)) ||
      (await this.productRepository.findBySlug(data.productId));

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const resolvedProductId = product.id;

    // 2. Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findUserProductReview(userId, resolvedProductId);
    if (existingReview) {
      // Update existing review
      const updated = await this.reviewRepository.update(existingReview.id, {
        rating: data.rating,
        title: data.title ?? existingReview.title,
        comment: data.comment ?? existingReview.comment,
        status: ReviewStatus.APPROVED,
      });
      return updated;
    }

    // 3. Check if user has an eligible order for verified purchase badge
    const orderId = await this.reviewRepository.findUserOrderForProduct(userId, resolvedProductId);

    // 4. Create review (auto-approved by default for immediate customer feedback)
    return this.reviewRepository.createReview({
      productId: resolvedProductId,
      userId,
      rating: data.rating,
      title: data.title?.trim() || null,
      comment: data.comment?.trim() || null,
      orderId,
      status: ReviewStatus.APPROVED,
    });
  }

  public async getProductReviews(
    productId: string,
    filters: {
      page?: number;
      limit?: number;
      rating?: number;
      sort?: string;
    }
  ) {
    // Check if productId is a slug or ID
    let resolvedProductId = productId;
    const product =
      (await this.productRepository.findByIdFull(productId)) ||
      (await this.productRepository.findBySlug(productId));

    if (product) {
      resolvedProductId = product.id;
    }

    const [reviewsData, summary] = await Promise.all([
      this.reviewRepository.findProductReviews(resolvedProductId, filters),
      this.reviewRepository.getProductReviewSummary(resolvedProductId),
    ]);

    return {
      reviews: reviewsData.reviews,
      meta: reviewsData.meta,
      summary,
    };
  }

  public async getMyReviews(userId: string) {
    return this.reviewRepository.findUserReviews(userId);
  }

  public async deleteMyReview(id: string, userId: string) {
    return this.reviewRepository.deleteUserReview(id, userId);
  }
}
