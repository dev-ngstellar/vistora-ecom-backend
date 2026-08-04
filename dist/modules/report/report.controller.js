"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const report_service_1 = require("./report.service");
class ReportController {
    reportService;
    constructor() {
        this.reportService = new report_service_1.ReportService();
    }
    getSalesReport = async (req, res) => {
        const startDate = req.query['startDate'];
        const endDate = req.query['endDate'];
        const data = await this.reportService.getSalesReport(startDate, endDate);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Sales report retrieved successfully', data);
    };
    getOrderReport = async (req, res) => {
        const startDate = req.query['startDate'];
        const endDate = req.query['endDate'];
        const data = await this.reportService.getOrderReport(startDate, endDate);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Order report retrieved successfully', data);
    };
    getProductReport = async (_req, res) => {
        const data = await this.reportService.getProductReport();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Product report retrieved successfully', data);
    };
    getCustomerReport = async (_req, res) => {
        const data = await this.reportService.getCustomerReport();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customer report retrieved successfully', data);
    };
    getInventoryReport = async (_req, res) => {
        const data = await this.reportService.getInventoryReport();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Inventory report retrieved successfully', data);
    };
    getCouponReport = async (_req, res) => {
        const data = await this.reportService.getCouponReport();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon report retrieved successfully', data);
    };
    getReviewReport = async (_req, res) => {
        const data = await this.reportService.getReviewReport();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Review report retrieved successfully', data);
    };
    getDashboardAnalytics = async (req, res) => {
        const startDate = req.query['startDate'];
        const endDate = req.query['endDate'];
        const data = await this.reportService.getDashboardAnalytics(startDate, endDate);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Dashboard analytics retrieved successfully', data);
    };
}
exports.ReportController = ReportController;
