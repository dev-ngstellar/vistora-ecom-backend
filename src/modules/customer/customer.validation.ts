import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      'Full name must contain only letters and spaces (no numbers or symbols)',
    ),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .transform((val) => val.replace(/[\s\-+]/g, '').replace(/^91/, ''))
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val),
      'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
    ),
  addressLine1: z
    .string({ required_error: 'Address line 1 is required' })
    .trim()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(120, 'Address line 1 cannot exceed 120 characters'),
  addressLine2: z.string().trim().max(120).optional().nullable(),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City is required')
    .max(50, 'City cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'City must contain only letters and spaces'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State is required')
    .max(50, 'State cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'State must contain only letters and spaces'),
  postalCode: z
    .string({ required_error: 'Postal code is required' })
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Postal code must be a valid 6-digit PIN code (e.g. 641012)'),
  country: z.string().trim().default('India'),
  type: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
  isDefault: z.boolean().optional().default(false),
});

export const createAddressSchema = z.object({
  body: addressSchema,
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Address ID is required'),
  }),
  body: addressSchema.partial(),
});
