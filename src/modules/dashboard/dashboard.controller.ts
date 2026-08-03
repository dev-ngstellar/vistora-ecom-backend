import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  private readonly dashboardService: DashboardService;

  constructor(dashboardService: DashboardService = new DashboardService()) {
    this.dashboardService = dashboardService;
  }

  public getDashboardSummary = async (_req: Request, res: Response): Promise<Response> => {
    const summary = await this.dashboardService.getDashboardSummary();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Dashboard summary overview statistics retrieved successfully',
      summary,
    );
  };
}
