import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { RoleController } from './role.controller';

const roleRouter = Router();
const roleController = new RoleController();

roleRouter.use(authenticate);
roleRouter.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

roleRouter.get('/roles/stats', asyncHandler(roleController.getRoleStats));
roleRouter.get('/roles', asyncHandler(roleController.getAllRoles));
roleRouter.get('/roles/:id', asyncHandler(roleController.getRoleById));
roleRouter.post('/roles', asyncHandler(roleController.createRole));
roleRouter.put('/roles/:id', asyncHandler(roleController.updateRole));

export { roleRouter };
