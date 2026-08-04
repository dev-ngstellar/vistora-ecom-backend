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
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplate = exports.listTemplates = exports.testChannel = exports.toggleChannel = exports.upsertChannel = exports.listChannels = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const notificationConfigService = __importStar(require("./notification-config.service"));
const userId = (req) => req.user?.id;
const ip = (req) => req.ip ?? req.socket?.remoteAddress;
// ===== CHANNELS =====
const listChannels = async (_req, res) => {
    const data = await notificationConfigService.listNotificationChannels();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification channels retrieved', data);
};
exports.listChannels = listChannels;
const upsertChannel = async (req, res) => {
    const data = await notificationConfigService.upsertNotificationChannel(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification channel saved', data);
};
exports.upsertChannel = upsertChannel;
const toggleChannel = async (req, res) => {
    const id = req.params['id'];
    const { enabled } = req.body;
    const data = await notificationConfigService.toggleNotificationChannel(id, enabled, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, `Notification channel ${enabled ? 'enabled' : 'disabled'}`, data);
};
exports.toggleChannel = toggleChannel;
const testChannel = async (req, res) => {
    const id = req.params['id'];
    const result = await notificationConfigService.testNotificationChannel(id, userId(req));
    const status = result.success ? http_status_constant_1.HTTP_STATUS.OK : http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
    return api_response_util_1.ApiResponseHandler.success(res, status, result.message, result);
};
exports.testChannel = testChannel;
// ===== TEMPLATES =====
const listTemplates = async (_req, res) => {
    const data = await notificationConfigService.listNotificationTemplates();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification templates retrieved', data);
};
exports.listTemplates = listTemplates;
const getTemplate = async (req, res) => {
    const id = req.params['id'];
    const data = await notificationConfigService.getNotificationTemplate(id);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Notification template not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification template retrieved', data);
};
exports.getTemplate = getTemplate;
const createTemplate = async (req, res) => {
    const data = await notificationConfigService.createNotificationTemplate(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.created(res, 'Notification template created', data);
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    const id = req.params['id'];
    const data = await notificationConfigService.updateNotificationTemplate(id, req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification template updated', data);
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    const id = req.params['id'];
    await notificationConfigService.deleteNotificationTemplate(id, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Notification template deleted', null);
};
exports.deleteTemplate = deleteTemplate;
