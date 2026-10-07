"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const reviewRouter = (0, express_1.Router)();
exports.reviewRouter = reviewRouter;
const reviewController = new review_controller_1.ReviewController();
// ==================== PUBLIC ENDPOINTS ====================
// Fetch reviews and aggregate summary for a specific product
reviewRouter.get('/reviews/product/:productId', (0, async_handler_util_1.asyncHandler)(reviewController.getProductReviews));
// Alternative RESTful path for product reviews
reviewRouter.get('/products/:productId/reviews', (0, async_handler_util_1.asyncHandler)(reviewController.getProductReviews));
// ==================== CUSTOMER AUTHENTICATED ENDPOINTS ====================
// Submit or update a product review
reviewRouter.post('/reviews', auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)(review_validation_1.createReviewSchema), (0, async_handler_util_1.asyncHandler)(reviewController.createReview));
// Get current customer's submitted reviews
reviewRouter.get('/reviews/me', auth_middleware_1.authenticate, (0, async_handler_util_1.asyncHandler)(reviewController.getMyReviews));
// Delete customer's own review
reviewRouter.delete('/reviews/me/:id', auth_middleware_1.authenticate, (0, async_handler_util_1.asyncHandler)(reviewController.deleteMyReview));
// ==================== ADMIN & MODERATION ENDPOINTS ====================
const adminReviewGuard = [
    auth_middleware_1.authenticate,
    (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
];
// Admin review overview stats
reviewRouter.get('/reviews/stats', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.getReviewStats));
// Admin paginated review search & moderation queue
reviewRouter.get('/reviews', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.getReviews));
// Admin review details by ID
reviewRouter.get('/reviews/:id', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.getReviewById));
// Admin approve review
reviewRouter.patch('/reviews/:id/approve', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.approveReview));
// Admin reject review
reviewRouter.patch('/reviews/:id/reject', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.rejectReview));
// Admin delete review
reviewRouter.delete('/reviews/:id', ...adminReviewGuard, (0, async_handler_util_1.asyncHandler)(reviewController.deleteReview));
