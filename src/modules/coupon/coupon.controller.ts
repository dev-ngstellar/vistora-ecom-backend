import { Request, Response } from 'express';
import { CouponStatus, CouponType } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CouponService } from './coupon.service';

export class CouponController {
  private readonly couponService: CouponService;

  constructor(couponService: CouponService = new CouponService()) {
    this.couponService = couponService;
  }

  public validateCoupon = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.couponService.validateCoupon(req.body);

    if (!result.valid) {
      return ApiResponseHandler.error(res, HTTP_STATUS.BAD_REQUEST, result.message, []);
    }

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, result.message, result);
  };

  public listActiveCoupons = async (_req: Request, res: Response): Promise<Response> => {
    const coupons = await this.couponService.listActiveCoupons();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Active coupons retrieved successfully',
      coupons,
    );
  };

  public getAllCoupons = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query['search'] as string,
      status: req.query['status'] as CouponStatus,
      type: req.query['type'] as CouponType,
      page: req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1,
      limit: req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10,
    };

    const result = await this.couponService.getAllCoupons(filters);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Coupons retrieved successfully',
      result.coupons,
      result.meta,
    );
  };

  public getCouponById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const coupon = await this.couponService.getCouponById(id);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Coupon retrieved successfully', coupon);
  };

  public createCoupon = async (req: Request, res: Response): Promise<Response> => {
    const coupon = await this.couponService.createCoupon(req.body);

    return ApiResponseHandler.created(res, 'Coupon created successfully', coupon);
  };

  public updateCoupon = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const coupon = await this.couponService.updateCoupon(id, req.body);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Coupon updated successfully', coupon);
  };

  public deleteCoupon = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.couponService.deleteCoupon(id);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Coupon deleted successfully', null);
  };

  public getCouponStats = async (_req: Request, res: Response): Promise<Response> => {
    const stats = await this.couponService.getCouponStats();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Coupon statistics retrieved successfully',
      stats,
    );
  };
}
