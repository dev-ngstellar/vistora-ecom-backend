import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler.util';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as controller from './shipping-config.controller';
import {
  createShippingProviderSchema,
  updateShippingProviderSchema,
  createShippingMethodSchema,
  updateShippingMethodSchema,
  createShippingZoneSchema,
  updateShippingZoneSchema,
} from './config.validation';

const router = Router();

router.use(asyncHandler(authenticate), requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

// ===== PROVIDERS =====
router.get('/providers', asyncHandler(controller.listProviders));
router.get('/providers/:id', asyncHandler(controller.getProvider));
router.post('/providers', validateRequest(createShippingProviderSchema), asyncHandler(controller.createProvider));
router.put('/providers/:id', validateRequest(updateShippingProviderSchema), asyncHandler(controller.updateProvider));
router.delete('/providers/:id', asyncHandler(controller.deleteProvider));
router.patch('/providers/:id/toggle', asyncHandler(controller.toggleProvider));
router.post('/providers/:id/test', asyncHandler(controller.testProvider));

// ===== METHODS =====
router.get('/methods', asyncHandler(controller.listMethods));
router.get('/methods/:id', asyncHandler(controller.getMethod));
router.post('/methods', validateRequest(createShippingMethodSchema), asyncHandler(controller.createMethod));
router.put('/methods/:id', validateRequest(updateShippingMethodSchema), asyncHandler(controller.updateMethod));
router.delete('/methods/:id', asyncHandler(controller.deleteMethod));

// ===== ZONES =====
router.get('/zones', asyncHandler(controller.listZones));
router.get('/zones/:id', asyncHandler(controller.getZone));
router.post('/zones', validateRequest(createShippingZoneSchema), asyncHandler(controller.createZone));
router.put('/zones/:id', validateRequest(updateShippingZoneSchema), asyncHandler(controller.updateZone));
router.delete('/zones/:id', asyncHandler(controller.deleteZone));

export { router as shippingConfigRouter };
