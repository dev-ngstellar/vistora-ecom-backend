import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { NotificationService } from './notification.service';

export class NotificationController {
  private readonly notificationService: NotificationService;

  constructor(notificationService: NotificationService = new NotificationService()) {
    this.notificationService = notificationService;
  }

  public getNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await this.notificationService.getNotifications(userId, limit);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Notifications retrieved successfully',
      result.notifications,
      { unreadCount: result.unreadCount, totalCount: result.totalCount },
    );
  };

  public getNotificationCount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const counts = await this.notificationService.getNotificationCount(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Notification count statistics retrieved successfully',
      counts,
    );
  };

  public markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const id = req.params.id as string;
    await this.notificationService.markAsRead(id, userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Notification marked as read',
      null,
    );
  };

  public markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    await this.notificationService.markAllAsRead(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'All notifications marked as read',
      null,
    );
  };
}
