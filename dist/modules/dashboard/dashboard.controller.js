"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const dashboard_service_1 = require("./dashboard.service");
class DashboardController {
    dashboardService;
    constructor(dashboardService = new dashboard_service_1.DashboardService()) {
        this.dashboardService = dashboardService;
    }
    getDashboardSummary = async (_req, res) => {
        const summary = await this.dashboardService.getDashboardSummary();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Dashboard summary overview statistics retrieved successfully', summary);
    };
}
exports.DashboardController = DashboardController;
