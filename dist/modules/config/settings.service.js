"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSetting = exports.bulkUpsertSettings = exports.upsertSetting = exports.getSetting = exports.listSettings = void 0;
const settings_repository_1 = require("./settings.repository");
const config_service_1 = require("./config.service");
const listSettings = async () => settings_repository_1.settingsRepository.findAll();
exports.listSettings = listSettings;
const getSetting = async (key) => settings_repository_1.settingsRepository.findByKey(key);
exports.getSetting = getSetting;
const upsertSetting = async (data, userId, ip) => {
    const existing = await settings_repository_1.settingsRepository.findByKey(data.key);
    const setting = await settings_repository_1.settingsRepository.upsert(data, userId);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SETTINGS',
        action: existing ? 'UPDATE_SETTING' : 'CREATE_SETTING',
        entityId: setting.id,
        entityType: 'Setting',
        oldValues: existing ? { value: existing.value } : undefined,
        newValues: { key: setting.key, value: setting.value },
        ipAddress: ip,
    });
    return setting;
};
exports.upsertSetting = upsertSetting;
const bulkUpsertSettings = async (data, userId, ip) => {
    const results = await settings_repository_1.settingsRepository.bulkUpsert(data.settings, userId);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SETTINGS',
        action: 'BULK_UPSERT_SETTINGS',
        entityType: 'Setting',
        newValues: { count: data.settings.length },
        ipAddress: ip,
    });
    return results;
};
exports.bulkUpsertSettings = bulkUpsertSettings;
const deleteSetting = async (key, userId, ip) => {
    const result = await settings_repository_1.settingsRepository.delete(key);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SETTINGS',
        action: 'DELETE_SETTING',
        entityType: 'Setting',
        newValues: { key },
        ipAddress: ip,
    });
    return result;
};
exports.deleteSetting = deleteSetting;
