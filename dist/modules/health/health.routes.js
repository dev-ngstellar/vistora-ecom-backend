"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const async_handler_util_1 = require("../../utils/async-handler.util");
const health_controller_1 = require("./health.controller");
const healthRouter = (0, express_1.Router)();
exports.healthRouter = healthRouter;
const healthController = new health_controller_1.HealthController();
/**
 * @route   GET /api/v1/health
 * @desc    Get API server health status
 * @access  Public
 */
healthRouter.get('/health', (0, async_handler_util_1.asyncHandler)(healthController.getHealth));
