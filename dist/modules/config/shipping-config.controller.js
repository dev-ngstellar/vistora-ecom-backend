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
exports.deleteZone = exports.updateZone = exports.createZone = exports.getZone = exports.listZones = exports.deleteMethod = exports.updateMethod = exports.createMethod = exports.getMethod = exports.listMethods = exports.testProvider = exports.toggleProvider = exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProvider = exports.listProviders = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const shippingConfigService = __importStar(require("./shipping-config.service"));
const userId = (req) => req.user?.id;
const ip = (req) => req.ip ?? req.socket?.remoteAddress;
// ===== PROVIDERS =====
const listProviders = async (_req, res) => {
    const data = await shippingConfigService.listShippingProviders();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping providers retrieved', data);
};
exports.listProviders = listProviders;
const getProvider = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.getShippingProvider(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Provider not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping provider retrieved', data);
};
exports.getProvider = getProvider;
const createProvider = async (req, res) => {
    const data = await shippingConfigService.createShippingProvider(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Shipping provider created', data);
};
exports.createProvider = createProvider;
const updateProvider = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.updateShippingProvider(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping provider updated', data);
};
exports.updateProvider = updateProvider;
const deleteProvider = async (req, res) => {
    const id = req.params['id'];
    await shippingConfigService.deleteShippingProvider(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping provider deleted', null);
};
exports.deleteProvider = deleteProvider;
const toggleProvider = async (req, res) => {
    const id = req.params['id'];
    const { enabled } = req.body;
    const data = await shippingConfigService.toggleShippingProvider(id, enabled, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, `Provider ${enabled ? 'enabled' : 'disabled'}`, data);
};
exports.toggleProvider = toggleProvider;
const testProvider = async (req, res) => {
    const id = req.params['id'];
    const result = await shippingConfigService.testShippingProvider(id, userId(req));
    const status = result.success ? http_status_constant_1.HTTP_STATUS.OK : http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
    return api_response_util_1.ApiResponseHandler.success(res, status, result.message, result);
};
exports.testProvider = testProvider;
// ===== METHODS =====
const listMethods = async (_req, res) => {
    const data = await shippingConfigService.listShippingMethods();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping methods retrieved', data);
};
exports.listMethods = listMethods;
const getMethod = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.getShippingMethod(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Method not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping method retrieved', data);
};
exports.getMethod = getMethod;
const createMethod = async (req, res) => {
    const data = await shippingConfigService.createShippingMethod(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Shipping method created', data);
};
exports.createMethod = createMethod;
const updateMethod = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.updateShippingMethod(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping method updated', data);
};
exports.updateMethod = updateMethod;
const deleteMethod = async (req, res) => {
    const id = req.params['id'];
    await shippingConfigService.deleteShippingMethod(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping method deleted', null);
};
exports.deleteMethod = deleteMethod;
// ===== ZONES =====
const listZones = async (_req, res) => {
    const data = await shippingConfigService.listShippingZones();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping zones retrieved', data);
};
exports.listZones = listZones;
const getZone = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.getShippingZone(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Zone not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping zone retrieved', data);
};
exports.getZone = getZone;
const createZone = async (req, res) => {
    const data = await shippingConfigService.createShippingZone(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Shipping zone created', data);
};
exports.createZone = createZone;
const updateZone = async (req, res) => {
    const id = req.params['id'];
    const data = await shippingConfigService.updateShippingZone(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping zone updated', data);
};
exports.updateZone = updateZone;
const deleteZone = async (req, res) => {
    const id = req.params['id'];
    await shippingConfigService.deleteShippingZone(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shipping zone deleted', null);
};
exports.deleteZone = deleteZone;
