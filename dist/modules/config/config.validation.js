"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpsertSettingsSchema = exports.upsertSettingSchema = exports.updateIntegrationStatusSchema = exports.updateIntegrationSchema = exports.createIntegrationSchema = exports.updateNotificationTemplateSchema = exports.createNotificationTemplateSchema = exports.upsertNotificationChannelSchema = exports.updatePaymentGatewaySchema = exports.createPaymentGatewaySchema = exports.updateShippingZoneSchema = exports.createShippingZoneSchema = exports.updateShippingMethodSchema = exports.createShippingMethodSchema = exports.updateShippingProviderSchema = exports.createShippingProviderSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
// ==================== SHIPPING PROVIDER ====================
exports.createShippingProviderSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Provider name is required'),
        carrier: zod_1.z.nativeEnum(client_1.ShippingCarrier).optional().default(client_1.ShippingCarrier.CUSTOM),
        displayName: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        logoUrl: zod_1.z.string().url().nullable().optional(),
        apiKey: zod_1.z.string().nullable().optional(),
        apiSecret: zod_1.z.string().nullable().optional(),
        baseUrl: zod_1.z.string().url().nullable().optional(),
        webhookUrl: zod_1.z.string().url().nullable().optional(),
        trackingUrl: zod_1.z.string().url().nullable().optional(),
        environment: zod_1.z.nativeEnum(client_1.ProviderEnvironment).optional().default(client_1.ProviderEnvironment.SANDBOX),
        enabled: zod_1.z.boolean().optional().default(false),
        priority: zod_1.z.number().int().min(1).max(100).optional().default(10),
    }),
});
exports.updateShippingProviderSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createShippingProviderSchema.shape.body.partial(),
});
// ==================== SHIPPING METHOD ====================
exports.createShippingMethodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        code: zod_1.z.string().min(2).transform((v) => v.toUpperCase()),
        description: zod_1.z.string().nullable().optional(),
        providerId: zod_1.z.string().nullable().optional(),
        baseRate: zod_1.z.number().nonnegative().optional().default(0),
        freeThreshold: zod_1.z.number().nonnegative().nullable().optional(),
        estimatedDays: zod_1.z.string().nullable().optional(),
        enabled: zod_1.z.boolean().optional().default(true),
    }),
});
exports.updateShippingMethodSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createShippingMethodSchema.shape.body.partial(),
});
// ==================== SHIPPING ZONE ====================
exports.createShippingZoneSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        countries: zod_1.z.array(zod_1.z.string()).optional().default([]),
        states: zod_1.z.array(zod_1.z.string()).optional().default([]),
        enabled: zod_1.z.boolean().optional().default(true),
        methodIds: zod_1.z.array(zod_1.z.string()).optional().default([]),
    }),
});
exports.updateShippingZoneSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createShippingZoneSchema.shape.body.partial(),
});
// ==================== PAYMENT GATEWAY ====================
exports.createPaymentGatewaySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        type: zod_1.z.nativeEnum(client_1.PaymentGatewayType).optional().default(client_1.PaymentGatewayType.CUSTOM),
        displayName: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        logoUrl: zod_1.z.string().url().nullable().optional(),
        apiKey: zod_1.z.string().nullable().optional(),
        apiSecret: zod_1.z.string().nullable().optional(),
        webhookSecret: zod_1.z.string().nullable().optional(),
        webhookUrl: zod_1.z.string().url().nullable().optional(),
        environment: zod_1.z.nativeEnum(client_1.ProviderEnvironment).optional().default(client_1.ProviderEnvironment.SANDBOX),
        enabled: zod_1.z.boolean().optional().default(false),
        supportedCurrencies: zod_1.z.array(zod_1.z.string()).optional().default(['INR']),
    }),
});
exports.updatePaymentGatewaySchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createPaymentGatewaySchema.shape.body.partial(),
});
// ==================== NOTIFICATION CHANNEL ====================
exports.upsertNotificationChannelSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.nativeEnum(client_1.NotificationChannelType),
        provider: zod_1.z.string().min(1),
        apiKey: zod_1.z.string().nullable().optional(),
        apiSecret: zod_1.z.string().nullable().optional(),
        fromAddress: zod_1.z.string().email().nullable().optional(),
        fromName: zod_1.z.string().nullable().optional(),
        smtpHost: zod_1.z.string().nullable().optional(),
        smtpPort: zod_1.z.number().int().nullable().optional(),
        smtpSecure: zod_1.z.boolean().optional().default(true),
        enabled: zod_1.z.boolean().optional().default(false),
    }),
});
// ==================== NOTIFICATION TEMPLATE ====================
exports.createNotificationTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        event: zod_1.z.string().min(2),
        channelType: zod_1.z.nativeEnum(client_1.NotificationChannelType),
        channelId: zod_1.z.string().nullable().optional(),
        subject: zod_1.z.string().nullable().optional(),
        body: zod_1.z.string().min(1),
        variables: zod_1.z.array(zod_1.z.string()).optional().default([]),
        enabled: zod_1.z.boolean().optional().default(true),
    }),
});
exports.updateNotificationTemplateSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createNotificationTemplateSchema.shape.body.partial(),
});
// ==================== INTEGRATION ====================
exports.createIntegrationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        slug: zod_1.z
            .string()
            .min(2)
            .transform((v) => v.toLowerCase().replace(/\s+/g, '-')),
        category: zod_1.z.nativeEnum(client_1.IntegrationCategory).optional().default(client_1.IntegrationCategory.OTHER),
        description: zod_1.z.string().nullable().optional(),
        logoUrl: zod_1.z.string().url().nullable().optional(),
        docsUrl: zod_1.z.string().url().nullable().optional(),
        apiKey: zod_1.z.string().nullable().optional(),
        apiSecret: zod_1.z.string().nullable().optional(),
        config: zod_1.z.record(zod_1.z.string()).nullable().optional(),
        enabled: zod_1.z.boolean().optional().default(false),
    }),
});
exports.updateIntegrationSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.createIntegrationSchema.shape.body.partial(),
});
exports.updateIntegrationStatusSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.IntegrationStatus),
        enabled: zod_1.z.boolean(),
    }),
});
// ==================== SETTINGS ====================
exports.upsertSettingSchema = zod_1.z.object({
    params: zod_1.z.object({ key: zod_1.z.string() }),
    body: zod_1.z.object({
        value: zod_1.z.string(),
        description: zod_1.z.string().nullable().optional(),
    }),
});
exports.bulkUpsertSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        settings: zod_1.z.array(zod_1.z.object({
            key: zod_1.z.string().min(1),
            value: zod_1.z.string(),
            description: zod_1.z.string().nullable().optional(),
        })),
    }),
});
