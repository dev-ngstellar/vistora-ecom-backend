import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const nodeEnv = process.env['NODE_ENV'] || 'development';
const envFile = nodeEnv === 'test' ? '.env.test' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().optional().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

  SMTP_HOST: z.string().optional().default('localhost'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('Vistora Commerce <noreply@vistoracommerce.com>'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const _env = envSchema.safeParse(process.env);
  if (!_env.success) {
    console.error('❌ Invalid environment variable configuration:');
    console.error(JSON.stringify(_env.error.format(), null, 2));
    process.exit(1);
  }
  return _env.data;
};

export const env: EnvConfig = parseEnv();
