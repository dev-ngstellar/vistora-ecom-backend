import { AccountStatus, UserRole } from '@prisma/client';
import { AdminUserQueryFilters, AdminUserRepository } from '../../repositories/admin-user.repository';
import { ApiError } from '../../utils/api-error.util';

export class AdminUserService {
  private adminUserRepository: AdminUserRepository;

  constructor() {
    this.adminUserRepository = new AdminUserRepository();
  }

  public async getAdminUsers(filters: AdminUserQueryFilters) {
    return this.adminUserRepository.findAdminUsers(filters);
  }

  public async getAdminUserById(id: string) {
    const user = await this.adminUserRepository.findAdminUserById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  public async createStaffUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordRaw: string;
    phone?: string;
    roleName: UserRole;
  }) {
    const existing = await this.adminUserRepository.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict(`User with email '${data.email}' already exists`);
    }

    return this.adminUserRepository.createStaffUser(data);
  }

  public async updateStaffUser(id: string, data: { firstName?: string; lastName?: string; phone?: string; roleName?: UserRole }) {
    const existing = await this.adminUserRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('User not found');
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

  public async updateAccountStatus(id: string, status: AccountStatus) {
    const existing = await this.adminUserRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('User not found');
    }
    return this.adminUserRepository.updateAccountStatus(id, status);
  }

  public async resetPassword(id: string, newPasswordRaw: string) {
    const existing = await this.adminUserRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('User not found');
    }
    return this.adminUserRepository.resetPassword(id, newPasswordRaw);
  }

  public async getUserStats() {
    return this.adminUserRepository.getUserStats();
  }
}
