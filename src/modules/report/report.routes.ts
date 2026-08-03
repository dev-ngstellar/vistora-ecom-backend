import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { ReportController } from './report.controller';

const reportRouter = Router();
const reportController = new ReportController();

reportRouter.use(authenticate);
reportRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER));

reportRouter.get('/reports/dashboard', asyncHandler(reportController.getDashboardAnalytics));
reportRouter.get('/reports/sales', asyncHandler(reportController.getSalesReport));
reportRouter.get('/reports/orders', asyncHandler(reportController.getOrderReport));
reportRouter.get('/reports/products', asyncHandler(reportController.getProductReport));
reportRouter.get('/reports/customers', asyncHandler(reportController.getCustomerReport));
reportRouter.get('/reports/inventory', asyncHandler(reportController.getInventoryReport));
reportRouter.get('/reports/coupons', asyncHandler(reportController.getCouponReport));
reportRouter.get('/reports/reviews', asyncHandler(reportController.getReviewReport));

export { reportRouter };
