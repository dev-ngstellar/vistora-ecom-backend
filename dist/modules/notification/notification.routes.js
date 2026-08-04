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
notificationRouter.get('/notifications/count', auth_middleware_1.authenticate, (0, async_handler_util_1.asyncHandler)(notificationController.getNotificationCount));
