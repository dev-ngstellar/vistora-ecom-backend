"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter = dashboardRouter;
const dashboardController = new dashboard_controller_1.DashboardController();
/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get store dashboard metrics summary
 *     description: Retrieves high-level sales, order queue, customer counts, and stock alert statistics for staff dashboards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                   example: Dashboard summary overview statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                       example: 128450.00
 *                     totalOrders:
 *                       type: integer
 *                       example: 1482
 *                     pendingOrders:
 *                       type: integer
 *                       example: 38
 *                     totalCustomers:
 *                       type: integer
 *                       example: 894
 *                     newCustomersToday:
 *                       type: integer
 *                       example: 12
 *                     totalProducts:
 *                       type: integer
 *                       example: 342
 *                     lowStockCount:
 *                       type: integer
 *                       example: 5
 *                     currency:
 *                       type: string
 *                       example: USD
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Requires Super Admin, Admin, or Manager role
 */
dashboardRouter.get('/dashboard/summary', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(dashboardController.getDashboardSummary));
