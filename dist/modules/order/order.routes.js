"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const order_controller_1 = require("./order.controller");
const orderRouter = (0, express_1.Router)();
exports.orderRouter = orderRouter;
const orderController = new order_controller_1.OrderController();
orderRouter.use('/orders', auth_middleware_1.authenticate);
// ==================== CUSTOMER SELF-SERVICE ORDER ROUTES ====================
/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get logged-in customer's order history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
orderRouter.get('/orders/my', (0, async_handler_util_1.asyncHandler)(orderController.getMyOrders));
/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a direct customer order (e.g. COD)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *               - paymentMethod
 *             properties:
 *               addressId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, RAZORPAY, STRIPE]
 *               couponCode:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
orderRouter.post('/orders', (0, async_handler_util_1.asyncHandler)(orderController.createCustomerOrder));
// ==================== ADMIN MANAGEMENT ROUTES ====================
/**
 * @openapi
 * /orders/stats:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order KPI metrics and statistics (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics summary
 */
orderRouter.get('/orders/stats', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(orderController.getOrderStats));
/**
 * @openapi
 * /orders/export:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Export orders to CSV spreadsheet (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file stream
 */
orderRouter.get('/orders/export', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(orderController.exportOrdersCsv));
/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: List all orders with filters and pagination (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated orders list
 */
orderRouter.get('/orders', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(orderController.getOrders));
/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details by ID
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
 *         description: Full order details
 */
orderRouter.get('/orders/:id', (0, async_handler_util_1.asyncHandler)(orderController.getOrderById));
/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update order fulfillment status (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
orderRouter.patch('/orders/:id/status', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(orderController.updateOrderStatus));
/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Cancel an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
orderRouter.post('/orders/:id/cancel', (0, async_handler_util_1.asyncHandler)(orderController.cancelOrder));
/**
 * @openapi
 * /orders/{id}/invoice:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get invoice details for order
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
 *         description: Invoice data
 */
orderRouter.get('/orders/:id/invoice', (0, async_handler_util_1.asyncHandler)(orderController.getInvoice));
