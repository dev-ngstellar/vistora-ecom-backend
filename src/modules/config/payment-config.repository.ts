import { prisma } from '../../config/prisma.config';
import { Prisma, ProviderStatus } from '@prisma/client';
import {
  CreatePaymentGatewayInput,
  UpdatePaymentGatewayInput,
} from './config.types';
import { encryptOptional } from '../../utils/encryption.util';

export const paymentGatewayRepository = {
  async findAll() {
    return prisma.paymentGateway.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.paymentGateway.findUnique({ where: { id } });
  },

  async create(data: CreatePaymentGatewayInput) {
    const { apiKey, apiSecret, webhookSecret, supportedCurrencies, ...rest } = data;
    return prisma.paymentGateway.create({
      data: {
        ...rest,
        apiKey: encryptOptional(apiKey),
        apiSecret: encryptOptional(apiSecret),
        webhookSecret: encryptOptional(webhookSecret),
        supportedCurrencies: supportedCurrencies ?? ['INR'],
      },
    });
  },

  async update(id: string, data: UpdatePaymentGatewayInput) {
    const updateData: Prisma.PaymentGatewayUpdateInput = { ...data };

    if (Object.prototype.hasOwnProperty.call(data, 'apiKey')) {
      updateData.apiKey = encryptOptional(data.apiKey);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'apiSecret')) {
      updateData.apiSecret = encryptOptional(data.apiSecret);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'webhookSecret')) {
      updateData.webhookSecret = encryptOptional(data.webhookSecret);
    }
    if (data.supportedCurrencies !== undefined) {
      updateData.supportedCurrencies = data.supportedCurrencies;
    }

    return prisma.paymentGateway.update({ where: { id }, data: updateData });
  },

  async delete(id: string) {
    return prisma.paymentGateway.delete({ where: { id } });
  },

  async toggle(id: string, enabled: boolean) {
    return prisma.paymentGateway.update({ where: { id }, data: { enabled } });
  },

  async markTested(id: string, success: boolean, error?: string) {
    return prisma.paymentGateway.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: success ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
        lastError: success ? null : error,
      },
    });
  },
};
