import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CustomerController } from './customer.controller';

const customerRouter = Router();
const customerController = new CustomerController();

customerRouter.use(authenticate);

// ==================== CUSTOMER SELF-SERVICE ADDRESS ROUTES ====================
customerRouter.get('/customers/addresses', asyncHandler(customerController.getMyAddresses));
customerRouter.post('/customers/addresses', asyncHandler(customerController.createAddress));
customerRouter.put('/customers/addresses/:id', asyncHandler(customerController.updateAddress));
customerRouter.delete('/customers/addresses/:id', asyncHandler(customerController.deleteAddress));

// ==================== ADMIN MANAGEMENT ROUTES ====================
customerRouter.get(
  '/customers/stats',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(customerController.getCustomerStats),
);
customerRouter.get(
  '/customers',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(customerController.getCustomers),
);
customerRouter.get(
  '/customers/:id',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(customerController.getCustomerDetails),
);
customerRouter.patch(
  '/customers/:id/status',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(customerController.updateCustomerStatus),
);

export { customerRouter };
