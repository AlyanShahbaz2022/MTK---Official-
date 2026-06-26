import { z } from 'zod';

export const GENDERS = ['MEN', 'WOMEN', 'KIDS', 'UNISEX'] as const;
export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60),
  gender: z.enum(GENDERS).default('UNISEX'),
});

const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and dashes');

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120),
  slug: slug.optional(),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  // Price in RUPEES from the form; converted to paisa server-side.
  price: z.coerce.number().int('Whole rupees only').min(0).max(100_000_000),
  categoryId: z.string().trim().min(1, 'Choose a category'),
  gender: z.enum(GENDERS),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
