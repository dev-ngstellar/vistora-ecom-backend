import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { RESPONSE_MESSAGE } from '../../constants/response-message.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { HealthService } from './health.service';

export class HealthController {
  private readonly healthService: HealthService;

  constructor(healthService: HealthService = new HealthService()) {
    this.healthService = healthService;
  }

  public getHealth = async (_req: Request, res: Response): Promise<Response> => {
    const healthData = await this.healthService.getHealthStatus();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      RESPONSE_MESSAGE.HEALTH_CHECK_SUCCESS,
      healthData,
    );
  };
}
