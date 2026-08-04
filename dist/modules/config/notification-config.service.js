"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationTemplate = exports.updateNotificationTemplate = exports.createNotificationTemplate = exports.getNotificationTemplate = exports.listNotificationTemplates = exports.testNotificationChannel = exports.toggleNotificationChannel = exports.upsertNotificationChannel = exports.listNotificationChannels = void 0;
const notification_config_repository_1 = require("./notification-config.repository");
const config_service_1 = require("./config.service");
// ===== CHANNELS =====
const listNotificationChannels = async () => {
    const channels = await notification_config_repository_1.notificationChannelRepository.findAll();
    return (0, config_service_1.sanitizeSecretsArray)(channels);
};
exports.listNotificationChannels = listNotificationChannels;
const upsertNotificationChannel = async (data, userId, ip) => {
    const channel = await notification_config_repository_1.notificationChannelRepository.upsert(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'NOTIFICATION_CONFIG',
        action: 'UPSERT_CHANNEL',
        entityId: channel.id,
        entityType: 'NotificationChannel',
        newValues: { type: channel.type, provider: channel.provider },
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(channel);
};
exports.upsertNotificationChannel = upsertNotificationChannel;
const toggleNotificationChannel = async (id, enabled, userId, ip) => {
    const channel = await notification_config_repository_1.notificationChannelRepository.toggle(id, enabled);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'NOTIFICATION_CONFIG',
        action: enabled ? 'ENABLE_CHANNEL' : 'DISABLE_CHANNEL',
        entityId: id,
        entityType: 'NotificationChannel',
        ipAddress: ip,
    });
    return channel;
};
exports.toggleNotificationChannel = toggleNotificationChannel;
const testNotificationChannel = async (id, userId) => {
    const channel = await notification_config_repository_1.notificationChannelRepository.findById(id);
    if (!channel)
        return { success: false, message: 'Channel not found' };
    // Stub — real provider SDK calls (Nodemailer, Twilio, FCM) go here
    const success = channel.enabled;
    const message = success
        ? `Test ${channel.type} notification sent via ${channel.provider}.`
        : `Channel ${channel.type} is disabled.`;
    await notification_config_repository_1.notificationChannelRepository.markTested(id, success, success ? undefined : message);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'NOTIFICATION_CONFIG',
        action: 'TEST_CHANNEL',
        entityId: id,
        entityType: 'NotificationChannel',
        newValues: { success },
    });
    return { success, message };
};
exports.testNotificationChannel = testNotificationChannel;
// ===== TEMPLATES =====
const listNotificationTemplates = async () => notification_config_repository_1.notificationTemplateRepository.findAll();
exports.listNotificationTemplates = listNotificationTemplates;
const getNotificationTemplate = async (id) => notification_config_repository_1.notificationTemplateRepository.findById(id);
exports.getNotificationTemplate = getNotificationTemplate;
const createNotificationTemplate = async (data, userId, ip) => {
    const template = await notification_config_repository_1.notificationTemplateRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
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
exports.createNotificationTemplate = createNotificationTemplate;
const updateNotificationTemplate = async (id, data, userId, ip) => {
    const template = await notification_config_repository_1.notificationTemplateRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'NOTIFICATION_CONFIG',
        action: 'UPDATE_TEMPLATE',
        entityId: id,
        entityType: 'NotificationTemplate',
        ipAddress: ip,
    });
    return template;
};
exports.updateNotificationTemplate = updateNotificationTemplate;
const deleteNotificationTemplate = async (id, userId, ip) => {
    const result = await notification_config_repository_1.notificationTemplateRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'NOTIFICATION_CONFIG',
        action: 'DELETE_TEMPLATE',
        entityId: id,
        entityType: 'NotificationTemplate',
        ipAddress: ip,
    });
    return result;
};
exports.deleteNotificationTemplate = deleteNotificationTemplate;
