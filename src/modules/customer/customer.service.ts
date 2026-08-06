import { AccountStatus } from '@prisma/client';
import { CustomerQueryFilters, CustomerRepository } from '../../repositories/customer.repository';
import { ApiError } from '../../utils/api-error.util';
import { prisma } from '../../config/prisma.config';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  public async getCustomers(filters: CustomerQueryFilters) {
    return this.customerRepository.findCustomers(filters);
  }

  public async getCustomerDetails(id: string) {
    const details = await this.customerRepository.findCustomerDetails(id);
    if (!details) {
      throw ApiError.notFound('Customer not found');
    }
    return details;
  }

  public async updateCustomerStatus(id: string, status: AccountStatus) {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Customer not found');
    }
    return this.customerRepository.updateCustomerStatus(id, status);
  }

  public async getCustomerStats() {
    return this.customerRepository.getCustomerStats();
  }

  // ==================== CUSTOMER ADDRESS CRUD ====================
  public async getMyAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createAddress(userId: string, data: any) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({
      data: {
        userId,
        type: data.type || 'HOME',
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'United States',
        isDefault: data.isDefault ?? false,
      },
    });
  }

  public async updateAddress(userId: string, addressId: string, data: any) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) {
      throw ApiError.notFound('Address not found or unauthorized');
    }
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const { id: _, userId: __, ...updateFields } = data;

    return prisma.address.update({
      where: { id: addressId },
      data: updateFields,
    });
  }

  public async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) {
      throw ApiError.notFound('Address not found or unauthorized');
    }
    return prisma.address.delete({
      where: { id: addressId },
    });
  }
}
