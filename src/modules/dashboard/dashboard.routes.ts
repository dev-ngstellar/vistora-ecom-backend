import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { DashboardController } from './dashboard.controller';

const dashboardRouter = Router();
const dashboardController = new DashboardController();

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
dashboardRouter.get(
  '/dashboard/summary',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(dashboardController.getDashboardSummary),
);

export { dashboardRouter };
