import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { InventoryController } from './inventory.controller';

const inventoryRouter = Router();
const inventoryController = new InventoryController();

inventoryRouter.get(
  '/inventory',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(inventoryController.getInventoryList)
);

inventoryRouter.post(
  '/inventory/adjust',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(inventoryController.adjustStock)
);

export { inventoryRouter };
