import { prisma } from '../../config/prisma.config';
import { ProviderStatus } from '@prisma/client';
import {
  UpsertNotificationChannelInput,
  CreateNotificationTemplateInput,
  UpdateNotificationTemplateInput,
} from './config.types';
import { encryptOptional } from '../../utils/encryption.util';

// ==================== NOTIFICATION CHANNEL ====================
export const notificationChannelRepository = {
  async findAll() {
    return prisma.notificationChannel.findMany({
      include: { templates: true },
      orderBy: { type: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.notificationChannel.findUnique({
      where: { id },
      include: { templates: true },
    });
  },

  async findByType(type: UpsertNotificationChannelInput['type']) {
    return prisma.notificationChannel.findUnique({ where: { type } });
  },

  async upsert(data: UpsertNotificationChannelInput) {
    const { apiKey, apiSecret, type, ...rest } = data;
    const encryptedKey = encryptOptional(apiKey);
    const encryptedSecret = encryptOptional(apiSecret);

    return prisma.notificationChannel.upsert({
      where: { type },
      create: {
        type,
        ...rest,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
      },
      update: {
        ...rest,
        ...(Object.prototype.hasOwnProperty.call(data, 'apiKey') && { apiKey: encryptedKey }),
        ...(Object.prototype.hasOwnProperty.call(data, 'apiSecret') && { apiSecret: encryptedSecret }),
      },
      include: { templates: true },
    });
  },

  async toggle(id: string, enabled: boolean) {
    return prisma.notificationChannel.update({
      where: { id },
      data: { enabled, status: enabled ? ProviderStatus.ACTIVE : ProviderStatus.INACTIVE },
    });
  },

  async markTested(id: string, success: boolean, error?: string) {
    return prisma.notificationChannel.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: success ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
        lastError: success ? null : error,
      },
    });
  },
};

// ==================== NOTIFICATION TEMPLATE ====================
export const notificationTemplateRepository = {
  async findAll() {
    return prisma.notificationTemplate.findMany({
      include: { channel: true },
      orderBy: [{ event: 'asc' }, { channelType: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.notificationTemplate.findUnique({
      where: { id },
      include: { channel: true },
    });
  },

  async create(data: CreateNotificationTemplateInput) {
    return prisma.notificationTemplate.create({
      data: {
        event: data.event,
        channelType: data.channelType,
        channelId: data.channelId ?? null,
        subject: data.subject ?? null,
        body: data.body,
        variables: data.variables ?? [],
        enabled: data.enabled ?? true,
      },
      include: { channel: true },
    });
  },

  async update(id: string, data: UpdateNotificationTemplateInput) {
    return prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...data,
        variables: data.variables ?? undefined,
      },
      include: { channel: true },
    });
  },

  async delete(id: string) {
    return prisma.notificationTemplate.delete({ where: { id } });
  },
};
