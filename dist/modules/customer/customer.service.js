"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const customer_repository_1 = require("../../repositories/customer.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class CustomerService {
    customerRepository;
    constructor() {
        this.customerRepository = new customer_repository_1.CustomerRepository();
    }
    async getCustomers(filters) {
        return this.customerRepository.findCustomers(filters);
    }
    async getCustomerDetails(id) {
        const details = await this.customerRepository.findCustomerDetails(id);
        if (!details) {
            throw api_error_util_1.ApiError.notFound('Customer not found');
        }
        return details;
    }
    async updateCustomerStatus(id, status) {
        const existing = await this.customerRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Customer not found');
        }
        return this.customerRepository.updateCustomerStatus(id, status);
    }
    async getCustomerStats() {
        return this.customerRepository.getCustomerStats();
    }
}
exports.CustomerService = CustomerService;
