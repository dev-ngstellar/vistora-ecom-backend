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
exports.paymentConfigRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const async_handler_util_1 = require("../../utils/async-handler.util");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const controller = __importStar(require("./payment-config.controller"));
const config_validation_1 = require("./config.validation");
const router = (0, express_1.Router)();
exports.paymentConfigRouter = router;
router.use((0, async_handler_util_1.asyncHandler)(auth_middleware_1.authenticate), (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN));
router.get('/gateways', (0, async_handler_util_1.asyncHandler)(controller.listGateways));
router.get('/gateways/:id', (0, async_handler_util_1.asyncHandler)(controller.getGateway));
router.post('/gateways', (0, validate_middleware_1.validateRequest)(config_validation_1.createPaymentGatewaySchema), (0, async_handler_util_1.asyncHandler)(controller.createGateway));
router.put('/gateways/:id', (0, validate_middleware_1.validateRequest)(config_validation_1.updatePaymentGatewaySchema), (0, async_handler_util_1.asyncHandler)(controller.updateGateway));
router.delete('/gateways/:id', (0, async_handler_util_1.asyncHandler)(controller.deleteGateway));
router.patch('/gateways/:id/toggle', (0, async_handler_util_1.asyncHandler)(controller.toggleGateway));
router.post('/gateways/:id/test', (0, async_handler_util_1.asyncHandler)(controller.testGateway));
