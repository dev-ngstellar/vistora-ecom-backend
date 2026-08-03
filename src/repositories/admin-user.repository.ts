import { AccountStatus, AuthProvider, Prisma, User, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { BaseRepository } from './base.repository';

export interface AdminUserQueryFilters {
  search?: string;
  roleName?: UserRole;
  status?: AccountStatus;
  page?: number;
  limit?: number;
}

export class AdminUserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  protected readonly model: Prisma.UserDelegate;

  constructor() {
    super();
    this.model = this.prisma.user;
  }

  public async findAdminUsers(filters: AdminUserQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

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

  public async findAdminUserById(id: string) {
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

  public async createStaffUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordRaw: string;
    phone?: string;
    roleName: UserRole;
  }) {
    const role = await this.prisma.role.findUnique({
      where: { name: data.roleName },
    });

    if (!role) {
      throw new Error(`Role ${data.roleName} not found`);
    }

    const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phone: data.phone || null,
        provider: AuthProvider.LOCAL,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        roleId: role.id,
      },
      include: { role: true },
    });
  }

  public async resetPassword(userId: string, newPasswordRaw: string) {
    const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  public async updateAccountStatus(userId: string, status: AccountStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      include: { role: true },
    });
  }

  public async assignRole(userId: string, roleName: UserRole) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: { role: true },
    });
  }

  public async getUserStats() {
    const [totalUsers, activeUsers, superAdmins, managers, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: AccountStatus.ACTIVE } }),
      this.prisma.user.count({ where: { role: { name: UserRole.SUPER_ADMIN } } }),
      this.prisma.user.count({ where: { role: { name: UserRole.MANAGER } } }),
      this.prisma.user.count({ where: { role: { name: UserRole.ADMIN } } }),
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
