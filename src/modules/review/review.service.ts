import { ReviewStatus } from '@prisma/client';
import { ReviewQueryFilters, ReviewRepository } from '../../repositories/review.repository';
import { ApiError } from '../../utils/api-error.util';

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
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
}
