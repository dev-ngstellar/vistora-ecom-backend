import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler.util';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as controller from './payment-config.controller';
import { createPaymentGatewaySchema, updatePaymentGatewaySchema } from './config.validation';

const router = Router();

router.use(asyncHandler(authenticate), requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/gateways', asyncHandler(controller.listGateways));
router.get('/gateways/:id', asyncHandler(controller.getGateway));
router.post('/gateways', validateRequest(createPaymentGatewaySchema), asyncHandler(controller.createGateway));
router.put('/gateways/:id', validateRequest(updatePaymentGatewaySchema), asyncHandler(controller.updateGateway));
router.delete('/gateways/:id', asyncHandler(controller.deleteGateway));
router.patch('/gateways/:id/toggle', asyncHandler(controller.toggleGateway));
router.post('/gateways/:id/test', asyncHandler(controller.testGateway));

export { router as paymentConfigRouter };
