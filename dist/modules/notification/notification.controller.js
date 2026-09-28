"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const notification_service_1 = require("./notification.service");
class NotificationController {
    notificationService;
    constructor(notificationService = new notification_service_1.NotificationService()) {
        this.notificationService = notificationService;
    }
    getNotifications = async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        }
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const result = await this.notificationService.getNotifications(userId, limit);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notifications retrieved successfully', result.notifications, { unreadCount: result.unreadCount, totalCount: result.totalCount });
    };
    getNotificationCount = async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        }
        const counts = await this.notificationService.getNotificationCount(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification count statistics retrieved successfully', counts);
    };
    markAsRead = async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        }
        const id = req.params.id;
        await this.notificationService.markAsRead(id, userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification marked as read', null);
    };
    markAllAsRead = async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        }
        await this.notificationService.markAllAsRead(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'All notifications marked as read', null);
    };
}
exports.NotificationController = NotificationController;
