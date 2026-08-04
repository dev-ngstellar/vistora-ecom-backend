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
exports.deleteSetting = exports.bulkUpsertSettings = exports.upsertSetting = exports.getSetting = exports.listSettings = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const settingsService = __importStar(require("./settings.service"));
const userId = (req) => req.user?.id;
const ip = (req) => req.ip ?? req.socket?.remoteAddress;
const listSettings = async (_req, res) => {
    const data = await settingsService.listSettings();
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Settings retrieved', data);
};
exports.listSettings = listSettings;
const getSetting = async (req, res) => {
    const key = req.params['key'];
    const data = await settingsService.getSetting(key);
    if (!data)
        return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.NOT_FOUND, 'Setting not found');
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Setting retrieved', data);
};
exports.getSetting = getSetting;
const upsertSetting = async (req, res) => {
    const key = req.params['key'];
    const data = await settingsService.upsertSetting({ key, value: req.body.value, description: req.body.description }, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Setting saved', data);
};
exports.upsertSetting = upsertSetting;
const bulkUpsertSettings = async (req, res) => {
    const data = await settingsService.bulkUpsertSettings(req.body, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Settings saved in bulk', data);
};
exports.bulkUpsertSettings = bulkUpsertSettings;
const deleteSetting = async (req, res) => {
    const key = req.params['key'];
    await settingsService.deleteSetting(key, userId(req), ip(req));
    return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Setting deleted', null);
};
exports.deleteSetting = deleteSetting;
