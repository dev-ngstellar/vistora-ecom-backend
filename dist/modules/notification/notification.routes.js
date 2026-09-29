"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const notification_controller_1 = require("./notification.controller");
const notificationRouter = (0, express_1.Router)();
exports.notificationRouter = notificationRouter;
const notificationController = new notification_controller_1.NotificationController();
notificationRouter.use('/notifications', auth_middleware_1.authenticate);
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
notificationRouter.get('/notifications', (0, async_handler_util_1.asyncHandler)(notificationController.getNotifications));
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
notificationRouter.get('/notifications/count', (0, async_handler_util_1.asyncHandler)(notificationController.getNotificationCount));
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
notificationRouter.patch('/notifications/read-all', (0, async_handler_util_1.asyncHandler)(notificationController.markAllAsRead));
notificationRouter.post('/notifications/read-all', (0, async_handler_util_1.asyncHandler)(notificationController.markAllAsRead));
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
notificationRouter.patch('/notifications/:id/read', (0, async_handler_util_1.asyncHandler)(notificationController.markAsRead));
