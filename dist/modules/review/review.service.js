"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const review_repository_1 = require("../../repositories/review.repository");
const product_repository_1 = require("../../repositories/product.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class ReviewService {
    reviewRepository;
    productRepository;
    constructor() {
        this.reviewRepository = new review_repository_1.ReviewRepository();
        this.productRepository = new product_repository_1.ProductRepository();
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
    async createReview(userId, data) {
        // 1. Verify product exists
        const product = (await this.productRepository.findByIdFull(data.productId)) ||
            (await this.productRepository.findBySlug(data.productId));
        if (!product) {
            throw api_error_util_1.ApiError.notFound('Product not found');
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
                status: client_1.ReviewStatus.APPROVED,
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
            status: client_1.ReviewStatus.APPROVED,
        });
    }
    async getProductReviews(productId, filters) {
        // Check if productId is a slug or ID
        let resolvedProductId = productId;
        const product = (await this.productRepository.findByIdFull(productId)) ||
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
    async getMyReviews(userId) {
        return this.reviewRepository.findUserReviews(userId);
    }
    async deleteMyReview(id, userId) {
        return this.reviewRepository.deleteUserReview(id, userId);
    }
}
exports.ReviewService = ReviewService;
