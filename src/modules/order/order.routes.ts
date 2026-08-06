import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { OrderController } from './order.controller';

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.use(authenticate);

// ==================== CUSTOMER SELF-SERVICE ORDER & PAYMENT ROUTES ====================
orderRouter.get('/orders/my', asyncHandler(orderController.getMyOrders));
orderRouter.post('/orders', asyncHandler(orderController.createCustomerOrder));
orderRouter.post('/payments/verify', asyncHandler(orderController.verifyPayment));

// ==================== ADMIN MANAGEMENT ROUTES ====================
orderRouter.get(
  '/orders/stats',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(orderController.getOrderStats),
);
orderRouter.get(
  '/orders/export',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(orderController.exportOrdersCsv),
);
orderRouter.get(
  '/orders',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(orderController.getOrders),
);
orderRouter.get('/orders/:id', asyncHandler(orderController.getOrderById));
orderRouter.patch(
  '/orders/:id/status',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(orderController.updateOrderStatus),
);
orderRouter.post('/orders/:id/cancel', asyncHandler(orderController.cancelOrder));
orderRouter.get('/orders/:id/invoice', asyncHandler(orderController.getInvoice));

export { orderRouter };
