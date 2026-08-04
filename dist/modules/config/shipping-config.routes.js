"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingConfigRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const async_handler_util_1 = require("../../utils/async-handler.util");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const controller = __importStar(require("./shipping-config.controller"));
const config_validation_1 = require("./config.validation");
const router = (0, express_1.Router)();
exports.shippingConfigRouter = router;
router.use((0, async_handler_util_1.asyncHandler)(auth_middleware_1.authenticate), (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN));
// ===== PROVIDERS =====
router.get('/providers', (0, async_handler_util_1.asyncHandler)(controller.listProviders));
router.get('/providers/:id', (0, async_handler_util_1.asyncHandler)(controller.getProvider));
router.post('/providers', (0, validate_middleware_1.validateRequest)(config_validation_1.createShippingProviderSchema), (0, async_handler_util_1.asyncHandler)(controller.createProvider));
router.put('/providers/:id', (0, validate_middleware_1.validateRequest)(config_validation_1.updateShippingProviderSchema), (0, async_handler_util_1.asyncHandler)(controller.updateProvider));
router.delete('/providers/:id', (0, async_handler_util_1.asyncHandler)(controller.deleteProvider));
router.patch('/providers/:id/toggle', (0, async_handler_util_1.asyncHandler)(controller.toggleProvider));
router.post('/providers/:id/test', (0, async_handler_util_1.asyncHandler)(controller.testProvider));
// ===== METHODS =====
router.get('/methods', (0, async_handler_util_1.asyncHandler)(controller.listMethods));
router.get('/methods/:id', (0, async_handler_util_1.asyncHandler)(controller.getMethod));
router.post('/methods', (0, validate_middleware_1.validateRequest)(config_validation_1.createShippingMethodSchema), (0, async_handler_util_1.asyncHandler)(controller.createMethod));
router.put('/methods/:id', (0, validate_middleware_1.validateRequest)(config_validation_1.updateShippingMethodSchema), (0, async_handler_util_1.asyncHandler)(controller.updateMethod));
router.delete('/methods/:id', (0, async_handler_util_1.asyncHandler)(controller.deleteMethod));
// ===== ZONES =====
router.get('/zones', (0, async_handler_util_1.asyncHandler)(controller.listZones));
router.get('/zones/:id', (0, async_handler_util_1.asyncHandler)(controller.getZone));
router.post('/zones', (0, validate_middleware_1.validateRequest)(config_validation_1.createShippingZoneSchema), (0, async_handler_util_1.asyncHandler)(controller.createZone));
router.put('/zones/:id', (0, validate_middleware_1.validateRequest)(config_validation_1.updateShippingZoneSchema), (0, async_handler_util_1.asyncHandler)(controller.updateZone));
router.delete('/zones/:id', (0, async_handler_util_1.asyncHandler)(controller.deleteZone));
