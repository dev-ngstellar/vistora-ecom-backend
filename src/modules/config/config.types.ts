import {
  IntegrationCategory,
  NotificationChannelType,
  PaymentGatewayType,
  ProviderEnvironment,
  ShippingCarrier,
} from '@prisma/client';

// ==================== SHIPPING PROVIDER ====================
export interface CreateShippingProviderInput {
  name: string;
  carrier?: ShippingCarrier;
  displayName?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  baseUrl?: string | null;
  webhookUrl?: string | null;
  trackingUrl?: string | null;
  environment?: ProviderEnvironment;
  enabled?: boolean;
  priority?: number;
}

export interface UpdateShippingProviderInput extends Partial<CreateShippingProviderInput> {}

// ==================== SHIPPING METHOD ====================
export interface CreateShippingMethodInput {
  name: string;
  code: string;
  description?: string | null;
  providerId?: string | null;
  baseRate?: number;
  freeThreshold?: number | null;
  estimatedDays?: string | null;
  enabled?: boolean;
}

export interface UpdateShippingMethodInput extends Partial<CreateShippingMethodInput> {}

// ==================== SHIPPING ZONE ====================
export interface CreateShippingZoneInput {
  name: string;
  countries?: string[];
  states?: string[];
  enabled?: boolean;
  methodIds?: string[];
}

export interface UpdateShippingZoneInput extends Partial<CreateShippingZoneInput> {}

// ==================== PAYMENT GATEWAY ====================
export interface CreatePaymentGatewayInput {
  name: string;
  type?: PaymentGatewayType;
  displayName?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  webhookSecret?: string | null;
  webhookUrl?: string | null;
  environment?: ProviderEnvironment;
  enabled?: boolean;
  supportedCurrencies?: string[];
}

export interface UpdatePaymentGatewayInput extends Partial<CreatePaymentGatewayInput> {}

// ==================== NOTIFICATION CHANNEL ====================
export interface UpsertNotificationChannelInput {
  type: NotificationChannelType;
  provider: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  fromAddress?: string | null;
  fromName?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  enabled?: boolean;
}

// ==================== NOTIFICATION TEMPLATE ====================
export interface CreateNotificationTemplateInput {
  event: string;
  channelType: NotificationChannelType;
  channelId?: string | null;
  subject?: string | null;
  body: string;
  variables?: string[];
  enabled?: boolean;
}

export interface UpdateNotificationTemplateInput extends Partial<CreateNotificationTemplateInput> {}

// ==================== INTEGRATION ====================
export interface CreateIntegrationInput {
  name: string;
  slug: string;
  category?: IntegrationCategory;
  description?: string | null;
  logoUrl?: string | null;
  docsUrl?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  config?: Record<string, string> | null;
  enabled?: boolean;
}

export interface UpdateIntegrationInput extends Partial<CreateIntegrationInput> {}

// ==================== SETTINGS ====================
export interface UpsertSettingInput {
  key: string;
  value: string;
  description?: string | null;
}

export interface BulkUpsertSettingsInput {
  settings: UpsertSettingInput[];
}
