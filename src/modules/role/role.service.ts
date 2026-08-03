import { UserRole } from '@prisma/client';
import { RoleRepository } from '../../repositories/role.repository';
import { ApiError } from '../../utils/api-error.util';

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  public async getAllRoles() {
    return this.roleRepository.findAllRoles();
  }

  public async getRoleById(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound('Role not found');
    }
    return role;
  }

  public async updateRole(id: string, data: { description?: string; permissions?: any }) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Role not found');
    }

    return this.roleRepository.update(id, {
      description: data.description !== undefined ? data.description : existing.description,
      permissions: data.permissions !== undefined ? data.permissions : (existing as any).permissions,
    });
  }

  public async createRole(data: { name: string; description?: string; permissions?: any }) {
    const nameEnum = data.name.toUpperCase() as UserRole;
    const existing = await this.roleRepository.findByName(nameEnum);
    if (existing) {
      throw ApiError.conflict(`Role '${data.name}' already exists`);
    }

    return this.roleRepository.create({
      name: nameEnum,
      description: data.description || `${data.name} role`,
      permissions: data.permissions || null,
    });
  }

  public async getRoleStats() {
    return this.roleRepository.getRoleStats();
  }
}
