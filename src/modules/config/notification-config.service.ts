import {
  notificationChannelRepository,
  notificationTemplateRepository,
} from './notification-config.repository';
import { sanitizeSecrets, sanitizeSecretsArray, writeAuditLog } from './config.service';
import {
  UpsertNotificationChannelInput,
  CreateNotificationTemplateInput,
  UpdateNotificationTemplateInput,
} from './config.types';

// ===== CHANNELS =====
export const listNotificationChannels = async () => {
  const channels = await notificationChannelRepository.findAll();
  return sanitizeSecretsArray(channels as unknown as Record<string, unknown>[]);
};

export const upsertNotificationChannel = async (
  data: UpsertNotificationChannelInput,
  userId?: string,
  ip?: string,
) => {
  const channel = await notificationChannelRepository.upsert(data);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: 'UPSERT_CHANNEL',
    entityId: channel.id,
    entityType: 'NotificationChannel',
    newValues: { type: channel.type, provider: channel.provider },
    ipAddress: ip,
  });
  return sanitizeSecrets(channel as unknown as Record<string, unknown>);
};

export const toggleNotificationChannel = async (
  id: string,
  enabled: boolean,
  userId?: string,
  ip?: string,
) => {
  const channel = await notificationChannelRepository.toggle(id, enabled);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: enabled ? 'ENABLE_CHANNEL' : 'DISABLE_CHANNEL',
    entityId: id,
    entityType: 'NotificationChannel',
    ipAddress: ip,
  });
  return channel;
};

export const testNotificationChannel = async (id: string, userId?: string) => {
  const channel = await notificationChannelRepository.findById(id);
  if (!channel) return { success: false, message: 'Channel not found' };

  // Stub — real provider SDK calls (Nodemailer, Twilio, FCM) go here
  const success = channel.enabled;
  const message = success
    ? `Test ${channel.type} notification sent via ${channel.provider}.`
    : `Channel ${channel.type} is disabled.`;

  await notificationChannelRepository.markTested(id, success, success ? undefined : message);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: 'TEST_CHANNEL',
    entityId: id,
    entityType: 'NotificationChannel',
    newValues: { success },
  });
  return { success, message };
};

// ===== TEMPLATES =====
export const listNotificationTemplates = async () =>
  notificationTemplateRepository.findAll();

export const getNotificationTemplate = async (id: string) =>
  notificationTemplateRepository.findById(id);

export const createNotificationTemplate = async (
  data: CreateNotificationTemplateInput,
  userId?: string,
  ip?: string,
) => {
  const template = await notificationTemplateRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: 'CREATE_TEMPLATE',
    entityId: template.id,
    entityType: 'NotificationTemplate',
    newValues: { event: template.event, channelType: template.channelType },
    ipAddress: ip,
  });
  return template;
};

export const updateNotificationTemplate = async (
  id: string,
  data: UpdateNotificationTemplateInput,
  userId?: string,
  ip?: string,
) => {
  const template = await notificationTemplateRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: 'UPDATE_TEMPLATE',
    entityId: id,
    entityType: 'NotificationTemplate',
    ipAddress: ip,
  });
  return template;
};

export const deleteNotificationTemplate = async (id: string, userId?: string, ip?: string) => {
  const result = await notificationTemplateRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'NOTIFICATION_CONFIG',
    action: 'DELETE_TEMPLATE',
    entityId: id,
    entityType: 'NotificationTemplate',
    ipAddress: ip,
  });
  return result;
};
