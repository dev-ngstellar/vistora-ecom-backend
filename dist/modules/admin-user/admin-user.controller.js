"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const admin_user_service_1 = require("./admin-user.service");
class AdminUserController {
    adminUserService;
    constructor() {
        this.adminUserService = new admin_user_service_1.AdminUserService();
    }
    getAdminUsers = async (req, res) => {
        const filters = {
            search: req.query.search,
            roleName: req.query.roleName,
            status: req.query.status,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const result = await this.adminUserService.getAdminUsers(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Admin users retrieved successfully', result.users, result.meta);
    };
    getAdminUserById = async (req, res) => {
        const id = req.params['id'];
        const user = await this.adminUserService.getAdminUserById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'User retrieved successfully', user);
    };
    createStaffUser = async (req, res) => {
        const user = await this.adminUserService.createStaffUser(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Staff user created successfully', user);
    };
    updateStaffUser = async (req, res) => {
        const id = req.params['id'];
        const user = await this.adminUserService.updateStaffUser(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Staff user updated successfully', user);
    };
    updateAccountStatus = async (req, res) => {
        const id = req.params['id'];
        const { status } = req.body;
        const updated = await this.adminUserService.updateAccountStatus(id, status);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Account status updated successfully', updated);
    };
    resetPassword = async (req, res) => {
        const id = req.params['id'];
        const { password } = req.body;
        await this.adminUserService.resetPassword(id, password);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Password reset successfully', null);
    };
    getUserStats = async (_req, res) => {
        const stats = await this.adminUserService.getUserStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'User statistics retrieved successfully', stats);
    };
}
exports.AdminUserController = AdminUserController;
