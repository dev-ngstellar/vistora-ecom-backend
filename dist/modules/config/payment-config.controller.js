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
exports.testGateway = exports.toggleGateway = exports.deleteGateway = exports.updateGateway = exports.createGateway = exports.getGateway = exports.listGateways = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const paymentConfigService = __importStar(require("./payment-config.service"));
const userId = (req) => req.user?.id;
const ip = (req) => req.ip ?? req.socket?.remoteAddress;
const listGateways = async (_req, res) => {
    const data = await paymentConfigService.listPaymentGateways();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Payment gateways retrieved', data);
};
exports.listGateways = listGateways;
const getGateway = async (req, res) => {
    const id = req.params['id'];
    const data = await paymentConfigService.getPaymentGateway(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Payment gateway not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Payment gateway retrieved', data);
};
exports.getGateway = getGateway;
const createGateway = async (req, res) => {
    const data = await paymentConfigService.createPaymentGateway(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Payment gateway created', data);
};
exports.createGateway = createGateway;
const updateGateway = async (req, res) => {
    const id = req.params['id'];
    const data = await paymentConfigService.updatePaymentGateway(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Payment gateway updated', data);
};
exports.updateGateway = updateGateway;
const deleteGateway = async (req, res) => {
    const id = req.params['id'];
    await paymentConfigService.deletePaymentGateway(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Payment gateway deleted', null);
};
exports.deleteGateway = deleteGateway;
const toggleGateway = async (req, res) => {
    const id = req.params['id'];
    const { enabled } = req.body;
    const data = await paymentConfigService.togglePaymentGateway(id, enabled, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, `Payment gateway ${enabled ? 'enabled' : 'disabled'}`, data);
};
exports.toggleGateway = toggleGateway;
const testGateway = async (req, res) => {
    const id = req.params['id'];
    const result = await paymentConfigService.testPaymentGateway(id, userId(req));
    const status = result.success ? http_status_constant_1.HTTP_STATUS.OK : http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
    return api_response_util_1.ApiResponseHandler.success(res, status, result.message, result);
};
exports.testGateway = testGateway;
