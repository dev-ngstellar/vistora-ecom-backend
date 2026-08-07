"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const order_service_1 = require("./order.service");
class OrderController {
    orderService;
    constructor() {
        this.orderService = new order_service_1.OrderService();
    }
    getOrders = async (req, res) => {
        const filters = {
            search: req.query.search,
            status: req.query.status,
            paymentStatus: req.query.paymentStatus,
            shipmentStatus: req.query.shipmentStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const result = await this.orderService.getOrders(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Orders retrieved successfully', result.orders, result.meta);
    };
    getOrderById = async (req, res) => {
        const id = req.params['id'];
        const order = await this.orderService.getOrderById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Order retrieved successfully', order);
    };
    updateOrderStatus = async (req, res) => {
        const id = req.params['id'];
        const { status, remarks } = req.body;
        const updatedBy = req.user?.email || 'Store Manager';
        const order = await this.orderService.updateOrderStatus(id, status, remarks, updatedBy);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Order status updated successfully', order);
    };
    cancelOrder = async (req, res) => {
        const id = req.params['id'];
        const { reason } = req.body;
        const updatedBy = req.user?.email || 'Store Manager';
        const order = await this.orderService.cancelOrder(id, reason, updatedBy);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Order cancelled successfully', order);
    };
    getInvoice = async (req, res) => {
        const id = req.params['id'];
        const invoice = await this.orderService.getInvoice(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Invoice retrieved successfully', invoice);
    };
    getOrderStats = async (_req, res) => {
        const stats = await this.orderService.getOrderStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Order statistics retrieved successfully', stats);
    };
    exportOrdersCsv = async (req, res) => {
        const filters = {
            search: req.query.search,
            status: req.query.status,
            paymentStatus: req.query.paymentStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const csvContent = await this.orderService.exportOrdersCsv(filters);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');
        res.status(200).send(csvContent);
    };
    // ==================== CUSTOMER ORDER HANDLERS ====================
    createCustomerOrder = async (req, res) => {
        const userId = req.user?.id;
        if (!userId)
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        const order = await this.orderService.createCustomerOrder(userId, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.CREATED, 'Order placed successfully', order);
    };
    getMyOrders = async (req, res) => {
        const userId = req.user?.id;
        if (!userId)
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        const result = await this.orderService.getOrders({ userId, limit: 50 });
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Customer orders retrieved successfully', result.orders, result.meta);
    };
    verifyPayment = async (req, res) => {
        const result = await this.orderService.verifyPayment(req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Payment verified successfully', result);
    };
}
exports.OrderController = OrderController;
