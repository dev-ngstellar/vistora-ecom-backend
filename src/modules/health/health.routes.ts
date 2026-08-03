import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.util';
import { HealthController } from './health.controller';

const healthRouter = Router();
const healthController = new HealthController();

/**
 * @route   GET /api/v1/health
 * @desc    Get API server health status
 * @access  Public
 */
healthRouter.get('/health', asyncHandler(healthController.getHealth));

export { healthRouter };
