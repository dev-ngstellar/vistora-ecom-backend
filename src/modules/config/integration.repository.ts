import { prisma } from '../../config/prisma.config';
import { IntegrationStatus } from '@prisma/client';
import { CreateIntegrationInput, UpdateIntegrationInput } from './config.types';
import { encryptOptional } from '../../utils/encryption.util';

export const integrationRepository = {
  async findAll(category?: string) {
    return prisma.integration.findMany({
      where: category ? { category: category as never } : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.integration.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.integration.findUnique({ where: { slug } });
  },

  async create(data: CreateIntegrationInput) {
    const { apiKey, apiSecret, config, ...rest } = data;
    return prisma.integration.create({
      data: {
        ...rest,
        apiKey: encryptOptional(apiKey),
        apiSecret: encryptOptional(apiSecret),
        config: config ? encryptOptional(JSON.stringify(config)) : null,
      },
    });
  },

  async update(id: string, data: UpdateIntegrationInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (Object.prototype.hasOwnProperty.call(data, 'apiKey')) {
      updateData['apiKey'] = encryptOptional(data.apiKey);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'apiSecret')) {
      updateData['apiSecret'] = encryptOptional(data.apiSecret);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'config')) {
      updateData['config'] = data.config ? encryptOptional(JSON.stringify(data.config)) : null;
    }
    return prisma.integration.update({ where: { id }, data: updateData });
  },

  async delete(id: string) {
    return prisma.integration.delete({ where: { id } });
  },

  async toggle(id: string, enabled: boolean) {
    return prisma.integration.update({
      where: { id },
      data: {
        enabled,
        status: enabled ? IntegrationStatus.CONNECTED : IntegrationStatus.DISCONNECTED,
      },
    });
  },

  async markTested(id: string, success: boolean, error?: string) {
    return prisma.integration.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: success ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
        lastError: success ? null : error,
      },
    });
  },

  async markSynced(id: string) {
    return prisma.integration.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });
  },
};
