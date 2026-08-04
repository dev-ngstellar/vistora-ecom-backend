"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const role_service_1 = require("./role.service");
class RoleController {
    roleService;
    constructor() {
        this.roleService = new role_service_1.RoleService();
    }
    getAllRoles = async (_req, res) => {
        const roles = await this.roleService.getAllRoles();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Roles retrieved successfully', roles);
    };
    getRoleById = async (req, res) => {
        const id = req.params['id'];
        const role = await this.roleService.getRoleById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Role retrieved successfully', role);
    };
    createRole = async (req, res) => {
        const role = await this.roleService.createRole(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Role created successfully', role);
    };
    updateRole = async (req, res) => {
        const id = req.params['id'];
        const role = await this.roleService.updateRole(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Role updated successfully', role);
    };
    getRoleStats = async (_req, res) => {
        const stats = await this.roleService.getRoleStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Role statistics retrieved successfully', stats);
    };
}
exports.RoleController = RoleController;
