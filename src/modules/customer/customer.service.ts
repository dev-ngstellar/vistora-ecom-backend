import { AccountStatus } from '@prisma/client';
import { CustomerQueryFilters, CustomerRepository } from '../../repositories/customer.repository';
import { ApiError } from '../../utils/api-error.util';

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
}
