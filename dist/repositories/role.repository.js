"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const base_repository_1 = require("./base.repository");
class RoleRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.role;
    }
    async findAllRoles() {
        const roles = await this.prisma.role.findMany({
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
        return roles.map((role) => ({
            ...role,
            userCount: role._count.users,
        }));
    }
    async findByName(name) {
        return this.prisma.role.findUnique({
            where: { name },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
    }
    async updatePermissions(id, permissions) {
        return this.prisma.role.update({
            where: { id },
            data: { permissions },
        });
    }
    async getRoleStats() {
        const [totalRoles, totalUsers, roleCounts] = await Promise.all([
            this.prisma.role.count(),
            this.prisma.user.count(),
            this.prisma.role.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: { select: { users: true } },
                },
            }),
        ]);
        return {
            totalRoles,
            totalUsers,
            roleDistribution: roleCounts.map((r) => ({
                name: r.name,
                count: r._count.users,
            })),
        };
    }
}
exports.RoleRepository = RoleRepository;
