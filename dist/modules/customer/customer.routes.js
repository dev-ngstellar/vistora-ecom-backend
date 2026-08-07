"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const customer_controller_1 = require("./customer.controller");
const customerRouter = (0, express_1.Router)();
exports.customerRouter = customerRouter;
const customerController = new customer_controller_1.CustomerController();
customerRouter.use(auth_middleware_1.authenticate);
// ==================== CUSTOMER SELF-SERVICE ADDRESS ROUTES ====================
customerRouter.get('/customers/addresses', (0, async_handler_util_1.asyncHandler)(customerController.getMyAddresses));
customerRouter.post('/customers/addresses', (0, async_handler_util_1.asyncHandler)(customerController.createAddress));
customerRouter.put('/customers/addresses/:id', (0, async_handler_util_1.asyncHandler)(customerController.updateAddress));
customerRouter.delete('/customers/addresses/:id', (0, async_handler_util_1.asyncHandler)(customerController.deleteAddress));
// ==================== ADMIN MANAGEMENT ROUTES ====================
customerRouter.get('/customers/stats', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(customerController.getCustomerStats));
customerRouter.get('/customers', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(customerController.getCustomers));
customerRouter.get('/customers/:id', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(customerController.getCustomerDetails));
customerRouter.patch('/customers/:id/status', (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(customerController.updateCustomerStatus));
