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
    getNotificationCount = async (req, res) => {
        const userId = req.user?.id || 'guest';
        const counts = await this.notificationService.getNotificationCount(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification count statistics retrieved successfully', counts);
    };
}
exports.NotificationController = NotificationController;
