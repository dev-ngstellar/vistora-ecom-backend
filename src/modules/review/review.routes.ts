import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { ReviewController } from './review.controller';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.use(authenticate);
reviewRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER));

reviewRouter.get('/reviews/stats', asyncHandler(reviewController.getReviewStats));
reviewRouter.get('/reviews', asyncHandler(reviewController.getReviews));
reviewRouter.get('/reviews/:id', asyncHandler(reviewController.getReviewById));
reviewRouter.patch('/reviews/:id/approve', asyncHandler(reviewController.approveReview));
reviewRouter.patch('/reviews/:id/reject', asyncHandler(reviewController.rejectReview));
reviewRouter.delete('/reviews/:id', asyncHandler(reviewController.deleteReview));

export { reviewRouter };
