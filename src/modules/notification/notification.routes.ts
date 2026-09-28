import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { NotificationController } from './notification.controller';

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get list of notifications for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 */
notificationRouter.get(
  '/notifications',
  asyncHandler(notificationController.getNotifications),
);

/**
 * @openapi
 * /notifications/count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notification counts
 *     description: Retrieves total unread notification counts broken down by category.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification counts retrieved successfully
 */
notificationRouter.get(
  '/notifications/count',
  asyncHandler(notificationController.getNotificationCount),
);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
notificationRouter.patch(
  '/notifications/read-all',
  asyncHandler(notificationController.markAllAsRead),
);

notificationRouter.post(
  '/notifications/read-all',
  asyncHandler(notificationController.markAllAsRead),
);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
notificationRouter.patch(
  '/notifications/:id/read',
  asyncHandler(notificationController.markAsRead),
);

export { notificationRouter };
