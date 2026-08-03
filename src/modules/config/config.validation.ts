import {
  IntegrationCategory,
  IntegrationStatus,
  NotificationChannelType,
  PaymentGatewayType,
  ProviderEnvironment,
  ShippingCarrier,
} from '@prisma/client';
import { z } from 'zod';

// ==================== SHIPPING PROVIDER ====================
export const createShippingProviderSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Provider name is required'),
    carrier: z.nativeEnum(ShippingCarrier).optional().default(ShippingCarrier.CUSTOM),
    displayName: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().url().nullable().optional(),
    apiKey: z.string().nullable().optional(),
    apiSecret: z.string().nullable().optional(),
    baseUrl: z.string().url().nullable().optional(),
    webhookUrl: z.string().url().nullable().optional(),
    trackingUrl: z.string().url().nullable().optional(),
    environment: z.nativeEnum(ProviderEnvironment).optional().default(ProviderEnvironment.SANDBOX),
    enabled: z.boolean().optional().default(false),
    priority: z.number().int().min(1).max(100).optional().default(10),
  }),
});

export const updateShippingProviderSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createShippingProviderSchema.shape.body.partial(),
});

// ==================== SHIPPING METHOD ====================
export const createShippingMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).transform((v) => v.toUpperCase()),
    description: z.string().nullable().optional(),
    providerId: z.string().nullable().optional(),
    baseRate: z.number().nonnegative().optional().default(0),
    freeThreshold: z.number().nonnegative().nullable().optional(),
    estimatedDays: z.string().nullable().optional(),
    enabled: z.boolean().optional().default(true),
  }),
});

export const updateShippingMethodSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createShippingMethodSchema.shape.body.partial(),
});

// ==================== SHIPPING ZONE ====================
export const createShippingZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    countries: z.array(z.string()).optional().default([]),
    states: z.array(z.string()).optional().default([]),
    enabled: z.boolean().optional().default(true),
    methodIds: z.array(z.string()).optional().default([]),
  }),
});

export const updateShippingZoneSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createShippingZoneSchema.shape.body.partial(),
});

// ==================== PAYMENT GATEWAY ====================
export const createPaymentGatewaySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    type: z.nativeEnum(PaymentGatewayType).optional().default(PaymentGatewayType.CUSTOM),
    displayName: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().url().nullable().optional(),
    apiKey: z.string().nullable().optional(),
    apiSecret: z.string().nullable().optional(),
    webhookSecret: z.string().nullable().optional(),
    webhookUrl: z.string().url().nullable().optional(),
    environment: z.nativeEnum(ProviderEnvironment).optional().default(ProviderEnvironment.SANDBOX),
    enabled: z.boolean().optional().default(false),
    supportedCurrencies: z.array(z.string()).optional().default(['INR']),
  }),
});

export const updatePaymentGatewaySchema = z.object({
  params: z.object({ id: z.string() }),
  body: createPaymentGatewaySchema.shape.body.partial(),
});

// ==================== NOTIFICATION CHANNEL ====================
export const upsertNotificationChannelSchema = z.object({
  body: z.object({
    type: z.nativeEnum(NotificationChannelType),
    provider: z.string().min(1),
    apiKey: z.string().nullable().optional(),
    apiSecret: z.string().nullable().optional(),
    fromAddress: z.string().email().nullable().optional(),
    fromName: z.string().nullable().optional(),
    smtpHost: z.string().nullable().optional(),
    smtpPort: z.number().int().nullable().optional(),
    smtpSecure: z.boolean().optional().default(true),
    enabled: z.boolean().optional().default(false),
  }),
});

// ==================== NOTIFICATION TEMPLATE ====================
export const createNotificationTemplateSchema = z.object({
  body: z.object({
    event: z.string().min(2),
    channelType: z.nativeEnum(NotificationChannelType),
    channelId: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    body: z.string().min(1),
    variables: z.array(z.string()).optional().default([]),
    enabled: z.boolean().optional().default(true),
  }),
});

export const updateNotificationTemplateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createNotificationTemplateSchema.shape.body.partial(),
});

// ==================== INTEGRATION ====================
export const createIntegrationSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z
      .string()
      .min(2)
      .transform((v) => v.toLowerCase().replace(/\s+/g, '-')),
    category: z.nativeEnum(IntegrationCategory).optional().default(IntegrationCategory.OTHER),
    description: z.string().nullable().optional(),
    logoUrl: z.string().url().nullable().optional(),
    docsUrl: z.string().url().nullable().optional(),
    apiKey: z.string().nullable().optional(),
    apiSecret: z.string().nullable().optional(),
    config: z.record(z.string()).nullable().optional(),
    enabled: z.boolean().optional().default(false),
  }),
});

export const updateIntegrationSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createIntegrationSchema.shape.body.partial(),
});

export const updateIntegrationStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.nativeEnum(IntegrationStatus),
    enabled: z.boolean(),
  }),
});

// ==================== SETTINGS ====================
export const upsertSettingSchema = z.object({
  params: z.object({ key: z.string() }),
  body: z.object({
    value: z.string(),
    description: z.string().nullable().optional(),
  }),
});

export const bulkUpsertSettingsSchema = z.object({
  body: z.object({
    settings: z.array(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        description: z.string().nullable().optional(),
      }),
    ),
  }),
});
