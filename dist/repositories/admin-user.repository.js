"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserRepository = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const base_repository_1 = require("./base.repository");
class AdminUserRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.user;
    }
    async findAdminUsers(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.roleName) {
            where.role = {
                name: filters.roleName,
            };
        }
        if (filters.search) {
            const search = filters.search.trim();
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    role: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findAdminUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                addresses: true,
                auditLogs: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async createStaffUser(data) {
        const role = await this.prisma.role.findUnique({
            where: { name: data.roleName },
        });
        if (!role) {
            throw new Error(`Role ${data.roleName} not found`);
        }
        const hashedPassword = await bcrypt_1.default.hash(data.passwordRaw, 10);
        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email.toLowerCase(),
                password: hashedPassword,
                phone: data.phone || null,
                provider: client_1.AuthProvider.LOCAL,
                status: client_1.AccountStatus.ACTIVE,
                emailVerified: true,
                roleId: role.id,
            },
            include: { role: true },
        });
    }
    async resetPassword(userId, newPasswordRaw) {
        const hashedPassword = await bcrypt_1.default.hash(newPasswordRaw, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
    async updateAccountStatus(userId, status) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status },
            include: { role: true },
        });
    }
    async assignRole(userId, roleName) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new Error('Role not found');
        return this.prisma.user.update({
            where: { id: userId },
            data: { roleId: role.id },
            include: { role: true },
        });
    }
    async getUserStats() {
        const [totalUsers, activeUsers, superAdmins, managers, admins] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: client_1.AccountStatus.ACTIVE } }),
            this.prisma.user.count({ where: { role: { name: client_1.UserRole.SUPER_ADMIN } } }),
            this.prisma.user.count({ where: { role: { name: client_1.UserRole.MANAGER } } }),
            this.prisma.user.count({ where: { role: { name: client_1.UserRole.ADMIN } } }),
        ]);
        return {
            totalUsers,
            activeUsers,
            superAdmins,
            managers,
            admins,
        };
    }
}
exports.AdminUserRepository = AdminUserRepository;
