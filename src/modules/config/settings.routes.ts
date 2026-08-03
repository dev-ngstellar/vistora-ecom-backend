import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler.util';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as controller from './settings.controller';
import { upsertSettingSchema, bulkUpsertSettingsSchema } from './config.validation';

const router = Router();

router.use(asyncHandler(authenticate), requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/', asyncHandler(controller.listSettings));
router.put('/bulk', validateRequest(bulkUpsertSettingsSchema), asyncHandler(controller.bulkUpsertSettings));
router.get('/:key', asyncHandler(controller.getSetting));
router.put('/:key', validateRequest(upsertSettingSchema), asyncHandler(controller.upsertSetting));
router.delete('/:key', asyncHandler(controller.deleteSetting));

export { router as settingsRouter };
