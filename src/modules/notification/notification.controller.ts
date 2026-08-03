import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { NotificationService } from './notification.service';

export class NotificationController {
  private readonly notificationService: NotificationService;

  constructor(notificationService: NotificationService = new NotificationService()) {
    this.notificationService = notificationService;
  }

  public getNotificationCount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id || 'guest';
    const counts = await this.notificationService.getNotificationCount(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Notification count statistics retrieved successfully',
      counts,
    );
  };
}
