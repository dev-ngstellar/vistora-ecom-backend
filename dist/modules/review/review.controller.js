"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const client_1 = require("@prisma/client");
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const review_service_1 = require("./review.service");
class ReviewController {
    reviewService;
    constructor() {
        this.reviewService = new review_service_1.ReviewService();
    }
    // ==================== PUBLIC PRODUCT REVIEWS ====================
    getProductReviews = async (req, res) => {
        const productId = req.params['productId'];
        const filters = {
            page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
            limit: req.query['limit'] ? parseInt(req.query['limit'], 10) : 10,
            rating: req.query['rating'] ? parseInt(req.query['rating'], 10) : undefined,
            sort: req.query['sort'],
        };
        const result = await this.reviewService.getProductReviews(productId, filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product reviews retrieved successfully', result.reviews, { ...result.meta, summary: result.summary });
    };
    // ==================== CUSTOMER REVIEW ACTIONS ====================
    createReview = async (req, res) => {
        const userId = req.user.id;
        const { productId, rating, title, comment } = req.body;
        const review = await this.reviewService.createReview(userId, {
            productId,
            rating,
            title,
            comment,
        });
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Thank you! Your review has been submitted successfully.', review);
    };
    getMyReviews = async (req, res) => {
        const userId = req.user.id;
        const reviews = await this.reviewService.getMyReviews(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Reviews retrieved successfully', reviews);
    };
    deleteMyReview = async (req, res) => {
        const userId = req.user.id;
        const id = req.params['id'];
        await this.reviewService.deleteMyReview(id, userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review deleted successfully', null);
    };
    // ==================== ADMIN REVIEW MODERATION ====================
    getReviews = async (req, res) => {
        const filters = {
            search: req.query['search'],
            rating: req.query['rating'] ? parseInt(req.query['rating'], 10) : undefined,
            status: req.query['status'],
            productId: req.query['productId'],
            userId: req.query['userId'],
            page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
            limit: req.query['limit'] ? parseInt(req.query['limit'], 10) : 10,
        };
        const result = await this.reviewService.getReviews(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Reviews retrieved successfully', result.reviews, result.meta);
    };
    getReviewById = async (req, res) => {
        const id = req.params['id'];
        const review = await this.reviewService.getReviewById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review retrieved successfully', review);
    };
    approveReview = async (req, res) => {
        const id = req.params['id'];
        const updated = await this.reviewService.updateStatus(id, client_1.ReviewStatus.APPROVED);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review approved successfully', updated);
    };
    rejectReview = async (req, res) => {
        const id = req.params['id'];
        const updated = await this.reviewService.updateStatus(id, client_1.ReviewStatus.REJECTED);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review rejected successfully', updated);
    };
    deleteReview = async (req, res) => {
        const id = req.params['id'];
        await this.reviewService.deleteReview(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review deleted successfully', null);
    };
    getReviewStats = async (_req, res) => {
        const stats = await this.reviewService.getReviewStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review statistics retrieved successfully', stats);
    };
}
exports.ReviewController = ReviewController;
