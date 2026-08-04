"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const response_message_constant_1 = require("../../constants/response-message.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const health_service_1 = require("./health.service");
class HealthController {
    healthService;
    constructor(healthService = new health_service_1.HealthService()) {
        this.healthService = healthService;
    }
    getHealth = async (_req, res) => {
        const healthData = await this.healthService.getHealthStatus();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, response_message_constant_1.RESPONSE_MESSAGE.HEALTH_CHECK_SUCCESS, healthData);
    };
}
exports.HealthController = HealthController;
