import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler.util';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as controller from './integration.controller';
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  updateIntegrationStatusSchema,
} from './config.validation';

const router = Router();

router.use(asyncHandler(authenticate), requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/', asyncHandler(controller.listIntegrations));
router.get('/:id', asyncHandler(controller.getIntegration));
router.post('/', validateRequest(createIntegrationSchema), asyncHandler(controller.createIntegration));
router.put('/:id', validateRequest(updateIntegrationSchema), asyncHandler(controller.updateIntegration));
router.delete('/:id', asyncHandler(controller.deleteIntegration));
router.patch('/:id/toggle', validateRequest(updateIntegrationStatusSchema), asyncHandler(controller.toggleIntegration));
router.post('/:id/test', asyncHandler(controller.testIntegration));

export { router as integrationRouter };
