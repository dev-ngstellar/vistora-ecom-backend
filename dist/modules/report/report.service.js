"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const report_repository_1 = require("../../repositories/report.repository");
class ReportService {
    reportRepository;
    constructor() {
        this.reportRepository = new report_repository_1.ReportRepository();
    }
    async getSalesReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.reportRepository.getSalesReport(start, end);
    }
    async getOrderReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.reportRepository.getOrderReport(start, end);
    }
    async getProductReport() {
        return this.reportRepository.getProductReport();
    }
    async getCustomerReport() {
        return this.reportRepository.getCustomerReport();
    }
    async getInventoryReport() {
        return this.reportRepository.getInventoryReport();
    }
    async getCouponReport() {
        return this.reportRepository.getCouponReport();
    }
    async getReviewReport() {
        return this.reportRepository.getReviewReport();
    }
    async getDashboardAnalytics(startDate, endDate) {
        const [sales, orders, products, customers, inventory, coupons, reviews] = await Promise.all([
            this.getSalesReport(startDate, endDate),
            this.getOrderReport(startDate, endDate),
            this.getProductReport(),
            this.getCustomerReport(),
            this.getInventoryReport(),
            this.getCouponReport(),
            this.getReviewReport(),
        ]);
        return {
            sales,
            orders,
            products,
            customers,
            inventory,
            coupons,
            reviews,
        };
    }
}
exports.ReportService = ReportService;
