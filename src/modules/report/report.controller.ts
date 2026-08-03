import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { ReportService } from './report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public getSalesReport = async (req: Request, res: Response): Promise<Response> => {
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;
    const data = await this.reportService.getSalesReport(startDate, endDate);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Sales report retrieved successfully', data);
  };

  public getOrderReport = async (req: Request, res: Response): Promise<Response> => {
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;
    const data = await this.reportService.getOrderReport(startDate, endDate);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Order report retrieved successfully', data);
  };

  public getProductReport = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.reportService.getProductReport();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Product report retrieved successfully', data);
  };

  public getCustomerReport = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.reportService.getCustomerReport();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Customer report retrieved successfully', data);
  };

  public getInventoryReport = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.reportService.getInventoryReport();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Inventory report retrieved successfully', data);
  };

  public getCouponReport = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.reportService.getCouponReport();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Coupon report retrieved successfully', data);
  };

  public getReviewReport = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.reportService.getReviewReport();
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Review report retrieved successfully', data);
  };

  public getDashboardAnalytics = async (req: Request, res: Response): Promise<Response> => {
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;
    const data = await this.reportService.getDashboardAnalytics(startDate, endDate);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Dashboard analytics retrieved successfully', data);
  };
}
