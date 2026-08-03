import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { AdminUserController } from './admin-user.controller';

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

adminUserRouter.use(authenticate);
adminUserRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

adminUserRouter.get('/admin/users/stats', asyncHandler(adminUserController.getUserStats));
adminUserRouter.get('/admin/users', asyncHandler(adminUserController.getAdminUsers));
adminUserRouter.get('/admin/users/:id', asyncHandler(adminUserController.getAdminUserById));
adminUserRouter.post('/admin/users', asyncHandler(adminUserController.createStaffUser));
adminUserRouter.put('/admin/users/:id', asyncHandler(adminUserController.updateStaffUser));
adminUserRouter.patch('/admin/users/:id/status', asyncHandler(adminUserController.updateAccountStatus));
adminUserRouter.post('/admin/users/:id/reset-password', asyncHandler(adminUserController.resetPassword));

export { adminUserRouter };
