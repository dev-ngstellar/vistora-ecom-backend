"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const order_repository_1 = require("../../repositories/order.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class OrderService {
    orderRepository;
    constructor() {
        this.orderRepository = new order_repository_1.OrderRepository();
    }
    async getOrders(filters) {
        return this.orderRepository.findOrders(filters);
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findOrderById(id);
        if (!order) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        return order;
    }
    async updateOrderStatus(id, status, remarks, updatedBy) {
        const existing = await this.orderRepository.findOrderById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        return this.orderRepository.updateOrderStatus(id, status, remarks, updatedBy);
    }
    async cancelOrder(id, reason, updatedBy) {
        const existing = await this.orderRepository.findOrderById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        if (existing.status === client_1.OrderStatus.DELIVERED) {
            throw api_error_util_1.ApiError.badRequest('Delivered orders cannot be cancelled');
        }
        return this.orderRepository.cancelOrder(id, reason, updatedBy);
    }
    async getInvoice(orderId) {
        return this.orderRepository.ensureInvoice(orderId);
    }
    async getOrderStats() {
        return this.orderRepository.getOrderStats();
    }
    async exportOrdersCsv(filters) {
        const { orders } = await this.orderRepository.findOrders({ ...filters, limit: 10000 });
        const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Status', 'Payment Status', 'Total Amount', 'Items Count'];
        const rows = orders.map((o) => [
            o.orderNumber,
            new Date(o.createdAt).toISOString(),
            `"${o.user?.fullName || ''}"`,
            o.user?.email || '',
            o.status,
            o.payments[0]?.status || 'PENDING',
            o.total,
            o.items.length,
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        return csvContent;
    }
}
exports.OrderService = OrderService;
