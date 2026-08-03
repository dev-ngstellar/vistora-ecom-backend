import { Prisma, Role, UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class RoleRepository extends BaseRepository<Role, Prisma.RoleDelegate> {
  protected readonly model: Prisma.RoleDelegate;

  constructor() {
    super();
    this.model = this.prisma.role;
  }

  public async findAllRoles() {
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

  public async findByName(name: UserRole) {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  public async updatePermissions(id: string, permissions: any) {
    return this.prisma.role.update({
      where: { id },
      data: { permissions },
    });
  }

  public async getRoleStats() {
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
