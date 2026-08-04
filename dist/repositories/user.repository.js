"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { role: true },
        });
    }
    async findByPhone(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }
    async findByIdWithRole(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
    }
    async getRoleByName(roleName) {
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            // Fallback: create role if missing
            return this.prisma.role.create({
                data: { name: roleName, description: `${roleName} role` },
            });
        }
        return role;
    }
    async createCustomer(data) {
        const customerRole = await this.getRoleByName(client_1.UserRole.CUSTOMER);
        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email.toLowerCase(),
                password: data.passwordHash,
                phone: data.phone || null,
                provider: client_1.AuthProvider.LOCAL,
                status: client_1.AccountStatus.ACTIVE,
                roleId: customerRole.id,
            },
            include: { role: true },
        });
    }
    async updateLastLogin(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
}
exports.UserRepository = UserRepository;
