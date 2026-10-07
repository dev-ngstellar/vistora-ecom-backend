import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { ReviewController } from './review.controller';
import { createReviewSchema } from './review.validation';

const reviewRouter = Router();
const reviewController = new ReviewController();

// ==================== PUBLIC ENDPOINTS ====================
// Fetch reviews and aggregate summary for a specific product
reviewRouter.get(
  '/reviews/product/:productId',
  asyncHandler(reviewController.getProductReviews),
);

// Alternative RESTful path for product reviews
reviewRouter.get(
  '/products/:productId/reviews',
  asyncHandler(reviewController.getProductReviews),
);

// ==================== CUSTOMER AUTHENTICATED ENDPOINTS ====================
// Submit or update a product review
reviewRouter.post(
  '/reviews',
  authenticate,
  validateRequest(createReviewSchema),
  asyncHandler(reviewController.createReview),
);

// Get current customer's submitted reviews
reviewRouter.get(
  '/reviews/me',
  authenticate,
  asyncHandler(reviewController.getMyReviews),
);

// Delete customer's own review
reviewRouter.delete(
  '/reviews/me/:id',
  authenticate,
  asyncHandler(reviewController.deleteMyReview),
);

// ==================== ADMIN & MODERATION ENDPOINTS ====================
const adminReviewGuard = [
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
];

// Admin review overview stats
reviewRouter.get(
  '/reviews/stats',
  ...adminReviewGuard,
  asyncHandler(reviewController.getReviewStats),
);

// Admin paginated review search & moderation queue
reviewRouter.get(
  '/reviews',
  ...adminReviewGuard,
  asyncHandler(reviewController.getReviews),
);

// Admin review details by ID
reviewRouter.get(
  '/reviews/:id',
  ...adminReviewGuard,
  asyncHandler(reviewController.getReviewById),
);

// Admin approve review
reviewRouter.patch(
  '/reviews/:id/approve',
  ...adminReviewGuard,
  asyncHandler(reviewController.approveReview),
);

// Admin reject review
reviewRouter.patch(
  '/reviews/:id/reject',
  ...adminReviewGuard,
  asyncHandler(reviewController.rejectReview),
);

// Admin delete review
reviewRouter.delete(
  '/reviews/:id',
  ...adminReviewGuard,
  asyncHandler(reviewController.deleteReview),
);

export { reviewRouter };
