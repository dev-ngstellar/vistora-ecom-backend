"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_repository_1 = require("../../repositories/review.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class ReviewService {
    reviewRepository;
    constructor() {
        this.reviewRepository = new review_repository_1.ReviewRepository();
    }
    async getReviews(filters) {
        return this.reviewRepository.findReviews(filters);
    }
    async getReviewById(id) {
        const review = await this.reviewRepository.findReviewById(id);
        if (!review) {
            throw api_error_util_1.ApiError.notFound('Review not found');
        }
        return review;
    }
    async updateStatus(id, status) {
        const existing = await this.reviewRepository.findReviewById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Review not found');
        }
        return this.reviewRepository.updateStatus(id, status);
    }
    async deleteReview(id) {
        const existing = await this.reviewRepository.findReviewById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Review not found');
        }
        return this.reviewRepository.deleteReview(id);
    }
    async getReviewStats() {
        return this.reviewRepository.getReviewStats();
    }
}
exports.ReviewService = ReviewService;
