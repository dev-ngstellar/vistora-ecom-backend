"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserService = void 0;
const admin_user_repository_1 = require("../../repositories/admin-user.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class AdminUserService {
    adminUserRepository;
    constructor() {
        this.adminUserRepository = new admin_user_repository_1.AdminUserRepository();
    }
    async getAdminUsers(filters) {
        return this.adminUserRepository.findAdminUsers(filters);
    }
    async getAdminUserById(id) {
        const user = await this.adminUserRepository.findAdminUserById(id);
        if (!user) {
            throw api_error_util_1.ApiError.notFound('User not found');
        }
        return user;
    }
    async createStaffUser(data) {
        const existing = await this.adminUserRepository.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw api_error_util_1.ApiError.conflict(`User with email '${data.email}' already exists`);
        }
        return this.adminUserRepository.createStaffUser(data);
    }
    async updateStaffUser(id, data) {
        const existing = await this.adminUserRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('User not found');
        }
        if (data.roleName) {
            await this.adminUserRepository.assignRole(id, data.roleName);
        }
        return this.adminUserRepository.update(id, {
            firstName: data.firstName || existing.firstName,
            lastName: data.lastName || existing.lastName,
            fullName: data.firstName || data.lastName ? `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}` : existing.fullName,
            phone: data.phone !== undefined ? data.phone : existing.phone,
        });
    }
    async updateAccountStatus(id, status) {
        const existing = await this.adminUserRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('User not found');
        }
        return this.adminUserRepository.updateAccountStatus(id, status);
    }
    async resetPassword(id, newPasswordRaw) {
        const existing = await this.adminUserRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('User not found');
        }
        return this.adminUserRepository.resetPassword(id, newPasswordRaw);
    }
    async getUserStats() {
        return this.adminUserRepository.getUserStats();
    }
}
exports.AdminUserService = AdminUserService;
