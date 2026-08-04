"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const nodeEnv = process.env['NODE_ENV'] || 'development';
const envFile = nodeEnv === 'test' ? '.env.test' : '.env';
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    CLIENT_URL: zod_1.z.string().url().default('http://localhost:3000'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: zod_1.z.string().min(1, 'REDIS_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional().default(''),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional().default(''),
    GOOGLE_CALLBACK_URL: zod_1.z.string().optional().default(''),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_KEY: zod_1.z.string().optional().default(''),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional().default(''),
    RAZORPAY_KEY_ID: zod_1.z.string().optional().default(''),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional().default(''),
    STRIPE_SECRET_KEY: zod_1.z.string().optional().default(''),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional().default(''),
    SMTP_HOST: zod_1.z.string().optional().default('localhost'),
    SMTP_PORT: zod_1.z.coerce.number().default(2525),
    SMTP_USER: zod_1.z.string().optional().default(''),
    SMTP_PASS: zod_1.z.string().optional().default(''),
    EMAIL_FROM: zod_1.z.string().default('Vistora Commerce <noreply@vistoracommerce.com>'),
});
const parseEnv = () => {
    const _env = envSchema.safeParse(process.env);
    if (!_env.success) {
        console.error('❌ Invalid environment variable configuration:');
        console.error(JSON.stringify(_env.error.format(), null, 2));
        process.exit(1);
    }
    return _env.data;
};
exports.env = parseEnv();
