"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const role_repository_1 = require("../../repositories/role.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class RoleService {
    roleRepository;
    constructor() {
        this.roleRepository = new role_repository_1.RoleRepository();
    }
    async getAllRoles() {
        return this.roleRepository.findAllRoles();
    }
    async getRoleById(id) {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw api_error_util_1.ApiError.notFound('Role not found');
        }
        return role;
    }
    async updateRole(id, data) {
        const existing = await this.roleRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Role not found');
        }
        return this.roleRepository.update(id, {
            description: data.description !== undefined ? data.description : existing.description,
            permissions: data.permissions !== undefined ? data.permissions : existing.permissions,
        });
    }
    async createRole(data) {
        const nameEnum = data.name.toUpperCase();
        const existing = await this.roleRepository.findByName(nameEnum);
        if (existing) {
            throw api_error_util_1.ApiError.conflict(`Role '${data.name}' already exists`);
        }
        return this.roleRepository.create({
            name: nameEnum,
            description: data.description || `${data.name} role`,
            permissions: data.permissions || null,
        });
    }
    async getRoleStats() {
        return this.roleRepository.getRoleStats();
    }
}
exports.RoleService = RoleService;
