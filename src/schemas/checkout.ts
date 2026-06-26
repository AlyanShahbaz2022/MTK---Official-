import { z } from 'zod';

/** Checkout form validation — single source of truth (client + server). */
export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
  line1: z.string().trim().min(4, 'Enter your street address').max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Enter your city').max(60),
  state: z.string().trim().max(60).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().default('PK'),
  deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum(['COD', 'CARD', 'EASYPAISA']).default('COD'),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .optional()
    .or(z.literal('')),
});

export const couponPreviewSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
