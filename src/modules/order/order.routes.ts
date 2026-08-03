import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { OrderController } from './order.controller';

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.use(authenticate);
orderRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER));

orderRouter.get('/orders/stats', asyncHandler(orderController.getOrderStats));
orderRouter.get('/orders/export', asyncHandler(orderController.exportOrdersCsv));
orderRouter.get('/orders', asyncHandler(orderController.getOrders));
orderRouter.get('/orders/:id', asyncHandler(orderController.getOrderById));
orderRouter.patch('/orders/:id/status', asyncHandler(orderController.updateOrderStatus));
orderRouter.post('/orders/:id/cancel', asyncHandler(orderController.cancelOrder));
orderRouter.get('/orders/:id/invoice', asyncHandler(orderController.getInvoice));

export { orderRouter };
