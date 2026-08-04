"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z
            .string({ required_error: 'First name is required' })
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name cannot exceed 50 characters')
            .trim(),
        lastName: zod_1.z
            .string({ required_error: 'Last name is required' })
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name cannot exceed 50 characters')
            .trim(),
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
            .regex(/^[0-9]{10,15}$/, 'Phone number must contain between 10 and 15 digits')
            .optional(),
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
