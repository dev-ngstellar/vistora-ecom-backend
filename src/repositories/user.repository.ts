import { AccountStatus, AuthProvider, Prisma, Role, User, UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type UserWithRole = User & { role: Role };

export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  protected readonly model: Prisma.UserDelegate;

  constructor() {
    super();
    this.model = this.prisma.user;
  }

  public async findByEmail(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    }) as Promise<UserWithRole | null>;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  public async findByIdWithRole(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    }) as Promise<UserWithRole | null>;
  }

  public async getRoleByName(roleName: UserRole): Promise<Role> {
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

  public async createCustomer(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }): Promise<UserWithRole> {
    const customerRole = await this.getRoleByName(UserRole.CUSTOMER);

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase(),
        password: data.passwordHash,
        phone: data.phone || null,
        provider: AuthProvider.LOCAL,
        status: AccountStatus.ACTIVE,
        roleId: customerRole.id,
      },
      include: { role: true },
    }) as Promise<UserWithRole>;
  }

  public async updateLastLogin(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
