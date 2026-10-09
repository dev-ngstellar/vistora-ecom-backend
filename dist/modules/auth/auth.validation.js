"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z
            .string({ required_error: 'First name is required' })
            .trim()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name cannot exceed 50 characters')
            .regex(/^[a-zA-Z\s.'-]+$/, 'First name must contain only letters'),
        lastName: zod_1.z
            .string({ required_error: 'Last name is required' })
            .trim()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name cannot exceed 50 characters')
            .regex(/^[a-zA-Z\s.'-]+$/, 'Last name must contain only letters'),
        email: zod_1.z
            .string({ required_error: 'Email address is required' })
            .email('Invalid email address format')
            .toLowerCase()
            .trim(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit mobile number')
            .optional()
            .or(zod_1.z.literal(''))
            .nullish(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: 'Email address is required' })
            .email('Invalid email address format')
            .toLowerCase()
            .trim(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password cannot be empty'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        refreshToken: zod_1.z.string().optional(),
    })
        .optional(),
});
