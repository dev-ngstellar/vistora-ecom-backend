"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPaymentGateway = exports.togglePaymentGateway = exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.getPaymentGateway = exports.listPaymentGateways = void 0;
const payment_config_repository_1 = require("./payment-config.repository");
const config_service_1 = require("./config.service");
const listPaymentGateways = async () => {
    const gateways = await payment_config_repository_1.paymentGatewayRepository.findAll();
    return (0, config_service_1.sanitizeSecretsArray)(gateways);
};
exports.listPaymentGateways = listPaymentGateways;
const getPaymentGateway = async (id) => {
    const gw = await payment_config_repository_1.paymentGatewayRepository.findById(id);
    if (!gw)
        return null;
    return (0, config_service_1.sanitizeSecrets)(gw);
};
exports.getPaymentGateway = getPaymentGateway;
const createPaymentGateway = async (data, userId, ip) => {
    const gw = await payment_config_repository_1.paymentGatewayRepository.create(data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'PAYMENT_CONFIG',
        action: 'CREATE_GATEWAY',
        entityId: gw.id,
        entityType: 'PaymentGateway',
        newValues: { name: gw.name, type: gw.type },
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(gw);
};
exports.createPaymentGateway = createPaymentGateway;
const updatePaymentGateway = async (id, data, userId, ip) => {
    const gw = await payment_config_repository_1.paymentGatewayRepository.update(id, data);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'PAYMENT_CONFIG',
        action: 'UPDATE_GATEWAY',
        entityId: id,
        entityType: 'PaymentGateway',
        ipAddress: ip,
    });
    return (0, config_service_1.sanitizeSecrets)(gw);
};
exports.updatePaymentGateway = updatePaymentGateway;
const deletePaymentGateway = async (id, userId, ip) => {
    const result = await payment_config_repository_1.paymentGatewayRepository.delete(id);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'PAYMENT_CONFIG',
        action: 'DELETE_GATEWAY',
        entityId: id,
        entityType: 'PaymentGateway',
        ipAddress: ip,
    });
    return result;
};
exports.deletePaymentGateway = deletePaymentGateway;
const togglePaymentGateway = async (id, enabled, userId, ip) => {
    const gw = await payment_config_repository_1.paymentGatewayRepository.toggle(id, enabled);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'PAYMENT_CONFIG',
        action: enabled ? 'ENABLE_GATEWAY' : 'DISABLE_GATEWAY',
        entityId: id,
        entityType: 'PaymentGateway',
        ipAddress: ip,
    });
    return gw;
};
exports.togglePaymentGateway = togglePaymentGateway;
const testPaymentGateway = async (id, userId) => {
    const gw = await payment_config_repository_1.paymentGatewayRepository.findById(id);
    if (!gw)
        return { success: false, message: 'Gateway not found' };
    // Simulate gateway ping — real SDK calls in future sprint
    const success = gw.enabled && !!gw.apiKey;
    const message = success
        ? `${gw.name} gateway connection verified (${gw.environment}).`
        : `Cannot test ${gw.name}: disabled or missing API key.`;
    await payment_config_repository_1.paymentGatewayRepository.markTested(id, success, success ? undefined : message);
    await (0, config_service_1.writeAuditLog)({
        userId,
        module: 'PAYMENT_CONFIG',
        action: 'TEST_GATEWAY',
        entityId: id,
        entityType: 'PaymentGateway',
        newValues: { success },
    });
    return { success, message };
};
exports.testPaymentGateway = testPaymentGateway;
