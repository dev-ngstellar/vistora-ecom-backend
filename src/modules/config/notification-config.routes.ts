import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler.util';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as controller from './notification-config.controller';
import {
  upsertNotificationChannelSchema,
  createNotificationTemplateSchema,
  updateNotificationTemplateSchema,
} from './config.validation';

const router = Router();

router.use(asyncHandler(authenticate), requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

// ===== CHANNELS =====
router.get('/channels', asyncHandler(controller.listChannels));
router.post('/channels', validateRequest(upsertNotificationChannelSchema), asyncHandler(controller.upsertChannel));
router.patch('/channels/:id/toggle', asyncHandler(controller.toggleChannel));
router.post('/channels/:id/test', asyncHandler(controller.testChannel));

// ===== TEMPLATES =====
router.get('/templates', asyncHandler(controller.listTemplates));
router.get('/templates/:id', asyncHandler(controller.getTemplate));
router.post('/templates', validateRequest(createNotificationTemplateSchema), asyncHandler(controller.createTemplate));
router.put('/templates/:id', validateRequest(updateNotificationTemplateSchema), asyncHandler(controller.updateTemplate));
router.delete('/templates/:id', asyncHandler(controller.deleteTemplate));

export { router as notificationConfigRouter };
