"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testIntegration = exports.toggleIntegration = exports.deleteIntegration = exports.updateIntegration = exports.createIntegration = exports.getIntegration = exports.listIntegrations = void 0;
const integration_repository_1 = require("./integration.repository");
const config_service_1 = require("./config.service");
const listIntegrations = async (category) => {
    const integrations = await integration_repository_1.integrationRepository.findAll(category);
    return (0, config_service_1.sanitizeSecretsArray)(integrations);
};
exports.listIntegrations = listIntegrations;
const getIntegration = async (id) => {
    const integration = await integration_repository_1.integrationRepository.findById(id);
    if (!integration)
        return null;
    return (0, config_service_1.sanitizeSecrets)(integration);
};
exports.getIntegration = getIntegration;
const createIntegration = async (data, userId, ip) => {
    const integration = await integration_repository_1.integrationRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'INTEGRATIONS',
        action: 'CREATE_INTEGRATION',
        entityId: integration.id,
        entityType: 'Integration',
        newValues: { name: integration.name, slug: integration.slug },
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(integration);
};
exports.createIntegration = createIntegration;
const updateIntegration = async (id, data, userId, ip) => {
    const integration = await integration_repository_1.integrationRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'INTEGRATIONS',
        action: 'UPDATE_INTEGRATION',
        entityId: id,
        entityType: 'Integration',
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(integration);
};
exports.updateIntegration = updateIntegration;
const deleteIntegration = async (id, userId, ip) => {
    const result = await integration_repository_1.integrationRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'INTEGRATIONS',
        action: 'DELETE_INTEGRATION',
        entityId: id,
        entityType: 'Integration',
        ipAddress: ip,
    });
    return result;
};
exports.deleteIntegration = deleteIntegration;
const toggleIntegration = async (id, enabled, userId, ip) => {
    const integration = await integration_repository_1.integrationRepository.toggle(id, enabled);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'INTEGRATIONS',
        action: enabled ? 'CONNECT_INTEGRATION' : 'DISCONNECT_INTEGRATION',
        entityId: id,
        entityType: 'Integration',
        ipAddress: ip,
    });
    return integration;
};
exports.toggleIntegration = toggleIntegration;
const testIntegration = async (id, userId) => {
    const integration = await integration_repository_1.integrationRepository.findById(id);
    if (!integration)
        return { success: false, message: 'Integration not found' };
    // Real SDK calls will be injected per integration.slug in a future sprint
    const success = integration.enabled && !!integration.apiKey;
    const message = success
        ? `${integration.name} connection verified.`
        : `${integration.name}: disabled or missing API key.`;
    await integration_repository_1.integrationRepository.markTested(id, success, success ? undefined : message);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'INTEGRATIONS',
        action: 'TEST_INTEGRATION',
        entityId: id,
        entityType: 'Integration',
        newValues: { success },
    });
    return { success, message };
};
exports.testIntegration = testIntegration;
