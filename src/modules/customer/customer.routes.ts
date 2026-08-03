import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CustomerController } from './customer.controller';

const customerRouter = Router();
const customerController = new CustomerController();

customerRouter.use(authenticate);
customerRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER));

customerRouter.get('/customers/stats', asyncHandler(customerController.getCustomerStats));
customerRouter.get('/customers', asyncHandler(customerController.getCustomers));
customerRouter.get('/customers/:id', asyncHandler(customerController.getCustomerDetails));
customerRouter.patch('/customers/:id/status', asyncHandler(customerController.updateCustomerStatus));

export { customerRouter };
