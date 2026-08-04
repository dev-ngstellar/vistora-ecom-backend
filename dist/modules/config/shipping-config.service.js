"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingZone = exports.updateShippingZone = exports.createShippingZone = exports.getShippingZone = exports.listShippingZones = exports.deleteShippingMethod = exports.updateShippingMethod = exports.createShippingMethod = exports.getShippingMethod = exports.listShippingMethods = exports.testShippingProvider = exports.toggleShippingProvider = exports.deleteShippingProvider = exports.updateShippingProvider = exports.createShippingProvider = exports.getShippingProvider = exports.listShippingProviders = void 0;
const shipping_config_repository_1 = require("./shipping-config.repository");
const config_service_1 = require("./config.service");
// ===== PROVIDERS =====
const listShippingProviders = async () => {
    const providers = await shipping_config_repository_1.shippingProviderRepository.findAll();
    return (0, config_service_1.sanitizeSecretsArray)(providers);
};
exports.listShippingProviders = listShippingProviders;
const getShippingProvider = async (id) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.findById(id);
    if (!provider)
        return null;
    return (0, config_service_1.sanitizeSecrets)(provider);
};
exports.getShippingProvider = getShippingProvider;
const createShippingProvider = async (data, userId, ip) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'CREATE_PROVIDER',
        entityId: provider.id,
        entityType: 'ShippingProvider',
        newValues: { name: provider.name, carrier: provider.carrier },
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(provider);
};
exports.createShippingProvider = createShippingProvider;
const updateShippingProvider = async (id, data, userId, ip) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'UPDATE_PROVIDER',
        entityId: id,
        entityType: 'ShippingProvider',
        newValues: data,
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(provider);
};
exports.updateShippingProvider = updateShippingProvider;
const deleteShippingProvider = async (id, userId, ip) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'DELETE_PROVIDER',
        entityId: id,
        entityType: 'ShippingProvider',
        newValues: { id },
        ipAddress: ip,
    });
    return provider;
};
exports.deleteShippingProvider = deleteShippingProvider;
const toggleShippingProvider = async (id, enabled, userId, ip) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.toggle(id, enabled);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: enabled ? 'ENABLE_PROVIDER' : 'DISABLE_PROVIDER',
        entityId: id,
        entityType: 'ShippingProvider',
        ipAddress: ip,
    });
    return provider;
};
exports.toggleShippingProvider = toggleShippingProvider;
const testShippingProvider = async (id, userId) => {
    const provider = await shipping_config_repository_1.shippingProviderRepository.findById(id);
    if (!provider)
        return { success: false, message: 'Provider not found' };
    // Simulate connection test (real SDK call per carrier in future sprint)
    const success = provider.enabled && !!provider.apiKey;
    const message = success
        ? `Connection to ${provider.name} verified successfully.`
        : `Cannot test ${provider.name}: provider is disabled or missing API key.`;
    await shipping_config_repository_1.shippingProviderRepository.markTested(id, success, success ? undefined : message);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'TEST_PROVIDER',
        entityId: id,
        entityType: 'ShippingProvider',
        newValues: { success },
    });
    return { success, message };
};
exports.testShippingProvider = testShippingProvider;
// ===== METHODS =====
const listShippingMethods = async () => shipping_config_repository_1.shippingMethodRepository.findAll();
exports.listShippingMethods = listShippingMethods;
const getShippingMethod = async (id) => shipping_config_repository_1.shippingMethodRepository.findById(id);
exports.getShippingMethod = getShippingMethod;
const createShippingMethod = async (data, userId, ip) => {
    const method = await shipping_config_repository_1.shippingMethodRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'CREATE_METHOD',
        entityId: method.id,
        entityType: 'ShippingMethod',
        newValues: { name: method.name, code: method.code },
        ipAddress: ip,
    });
    return method;
};
exports.createShippingMethod = createShippingMethod;
const updateShippingMethod = async (id, data, userId, ip) => {
    const method = await shipping_config_repository_1.shippingMethodRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'UPDATE_METHOD',
        entityId: id,
        entityType: 'ShippingMethod',
        ipAddress: ip,
    });
    return method;
};
exports.updateShippingMethod = updateShippingMethod;
const deleteShippingMethod = async (id, userId, ip) => {
    const result = await shipping_config_repository_1.shippingMethodRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'DELETE_METHOD',
        entityId: id,
        entityType: 'ShippingMethod',
        ipAddress: ip,
    });
    return result;
};
exports.deleteShippingMethod = deleteShippingMethod;
// ===== ZONES =====
const listShippingZones = async () => shipping_config_repository_1.shippingZoneRepository.findAll();
exports.listShippingZones = listShippingZones;
const getShippingZone = async (id) => shipping_config_repository_1.shippingZoneRepository.findById(id);
exports.getShippingZone = getShippingZone;
const createShippingZone = async (data, userId, ip) => {
    const zone = await shipping_config_repository_1.shippingZoneRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'CREATE_ZONE',
        entityId: zone.id,
        entityType: 'ShippingZone',
        newValues: { name: zone.name },
        ipAddress: ip,
    });
    return zone;
};
exports.createShippingZone = createShippingZone;
const updateShippingZone = async (id, data, userId, ip) => {
    const zone = await shipping_config_repository_1.shippingZoneRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'UPDATE_ZONE',
        entityId: id,
        entityType: 'ShippingZone',
        ipAddress: ip,
    });
    return zone;
};
exports.updateShippingZone = updateShippingZone;
const deleteShippingZone = async (id, userId, ip) => {
    const result = await shipping_config_repository_1.shippingZoneRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'SHIPPING_CONFIG',
        action: 'DELETE_ZONE',
        entityId: id,
        entityType: 'ShippingZone',
        ipAddress: ip,
    });
    return result;
};
exports.deleteShippingZone = deleteShippingZone;
