import { Request, Response } from 'express';
import { ReviewStatus } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { ReviewService } from './review.service';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  // ==================== PUBLIC PRODUCT REVIEWS ====================

  public getProductReviews = async (req: Request, res: Response): Promise<Response> => {
    const productId = req.params['productId'] as string;
    const filters = {
      page: req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1,
      limit: req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10,
      rating: req.query['rating'] ? parseInt(req.query['rating'] as string, 10) : undefined,
      sort: req.query['sort'] as string | undefined,
    };

    const result = await this.reviewService.getProductReviews(productId, filters);
    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Product reviews retrieved successfully',
      result.reviews,
      { ...result.meta, summary: result.summary },
    );
  };

  // ==================== CUSTOMER REVIEW ACTIONS ====================

  public createReview = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const { productId, rating, title, comment } = req.body;

    const review = await this.reviewService.createReview(userId, {
      productId,
      rating,
      title,
      comment,
    });

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.CREATED,
      'Thank you! Your review has been submitted successfully.',
      review,
    );
  };

  public getMyReviews = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const reviews = await this.reviewService.getMyReviews(userId);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Reviews retrieved successfully', reviews);
  };

  public deleteMyReview = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const id = req.params['id'] as string;
    await this.reviewService.deleteMyReview(id, userId);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review deleted successfully', null);
  };

  // ==================== ADMIN REVIEW MODERATION ====================

  public getReviews = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query['search'] as string,
      rating: req.query['rating'] ? parseInt(req.query['rating'] as string, 10) : undefined,
      status: req.query['status'] as ReviewStatus,
      productId: req.query['productId'] as string,
      userId: req.query['userId'] as string,
      page: req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1,
      limit: req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10,
    };

    const result = await this.reviewService.getReviews(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Reviews retrieved successfully', result.reviews, result.meta);
  };

  public getReviewById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const review = await this.reviewService.getReviewById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review retrieved successfully', review);
  };

  public approveReview = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const updated = await this.reviewService.updateStatus(id, ReviewStatus.APPROVED);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review approved successfully', updated);
  };

  public rejectReview = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const updated = await this.reviewService.updateStatus(id, ReviewStatus.REJECTED);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review rejected successfully', updated);
  };

  public deleteReview = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.reviewService.deleteReview(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review deleted successfully', null);
  };

  public getReviewStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.reviewService.getReviewStats();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review statistics retrieved successfully', stats);
  };
}
