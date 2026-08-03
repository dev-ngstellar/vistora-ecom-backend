import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { NotificationController } from './notification.controller';

const notificationRouter = Router();
const notificationController = new NotificationController();

/**
 * @openapi
 * /notifications/count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notification counts
 *     description: Retrieves total unread notification counts broken down by category (order, inventory, customer, system).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification count statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 3
 *                     totalCount:
 *                       type: integer
 *                       example: 12
 *                     categories:
 *                       type: object
 *                       properties:
 *                         order:
 *                           type: integer
 *                           example: 1
 *                         inventory:
 *                           type: integer
 *                           example: 1
 *                         customer:
 *                           type: integer
 *                           example: 1
 *                         system:
 *                           type: integer
 *                           example: 0
 *       401:
 *         description: Unauthorized - Authentication required
 */
notificationRouter.get(
  '/notifications/count',
  authenticate,
  asyncHandler(notificationController.getNotificationCount),
);

export { notificationRouter };
