"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const customer_repository_1 = require("../../repositories/customer.repository");
const api_error_util_1 = require("../../utils/api-error.util");
const prisma_config_1 = require("../../config/prisma.config");
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
    // ==================== CUSTOMER ADDRESS CRUD ====================
    async getMyAddresses(userId) {
        return prisma_config_1.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createAddress(userId, data) {
        if (data.isDefault) {
            await prisma_config_1.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return prisma_config_1.prisma.address.create({
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
    async updateAddress(userId, addressId, data) {
        const existing = await prisma_config_1.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Address not found or unauthorized');
        }
        if (data.isDefault) {
            await prisma_config_1.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const { id: _, userId: __, ...updateFields } = data;
        return prisma_config_1.prisma.address.update({
            where: { id: addressId },
            data: updateFields,
        });
    }
    async deleteAddress(userId, addressId) {
        const existing = await prisma_config_1.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Address not found or unauthorized');
        }
        return prisma_config_1.prisma.address.delete({
            where: { id: addressId },
        });
    }
}
exports.CustomerService = CustomerService;
