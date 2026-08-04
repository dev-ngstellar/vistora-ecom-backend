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
exports.testIntegration = exports.toggleIntegration = exports.deleteIntegration = exports.updateIntegration = exports.createIntegration = exports.getIntegration = exports.listIntegrations = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const integrationService = __importStar(require("./integration.service"));
const userId = (req) => req.user?.id;
const ip = (req) => req.ip ?? req.socket?.remoteAddress;
const listIntegrations = async (req, res) => {
    const category = req.query['category'];
    const data = await integrationService.listIntegrations(category);
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Integrations retrieved', data);
};
exports.listIntegrations = listIntegrations;
const getIntegration = async (req, res) => {
    const id = req.params['id'];
    const data = await integrationService.getIntegration(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Integration not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Integration retrieved', data);
};
exports.getIntegration = getIntegration;
const createIntegration = async (req, res) => {
    const data = await integrationService.createIntegration(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Integration created', data);
};
exports.createIntegration = createIntegration;
const updateIntegration = async (req, res) => {
    const id = req.params['id'];
    const data = await integrationService.updateIntegration(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Integration updated', data);
};
exports.updateIntegration = updateIntegration;
const deleteIntegration = async (req, res) => {
    const id = req.params['id'];
    await integrationService.deleteIntegration(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Integration deleted', null);
};
exports.deleteIntegration = deleteIntegration;
const toggleIntegration = async (req, res) => {
    const id = req.params['id'];
    const { enabled } = req.body;
    const data = await integrationService.toggleIntegration(id, enabled, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, `Integration ${enabled ? 'connected' : 'disconnected'}`, data);
};
exports.toggleIntegration = toggleIntegration;
const testIntegration = async (req, res) => {
    const id = req.params['id'];
    const result = await integrationService.testIntegration(id, userId(req));
    const status = result.success ? http_status_constant_1.HTTP_STATUS.OK : http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
    return api_response_util_1.ApiResponseHandler.success(res, status, result.message, result);
};
exports.testIntegration = testIntegration;
