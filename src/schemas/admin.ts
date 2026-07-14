import { z } from 'zod';

export const GENDERS = ['MEN', 'WOMEN', 'KIDS'] as const;
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
  gender: z.enum(GENDERS).default('MEN'),
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
  subCategoryId: z.string().trim().optional().nullable(),
  fabric: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  careInstructions: z.string().trim().max(1000).optional().nullable().or(z.literal('')),
  season: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  gender: z.enum(GENDERS),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),

  // ── Advanced fields (Add Product v2) ──────────────────────────────
  sku: z.string().trim().max(100).optional().nullable().or(z.literal('')),
  salePrice: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  costPrice: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  minStockAlert: z.coerce.number().int().min(0).default(0),
  brand: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  productType: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  collection: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  material: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  color: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  secondaryColor: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  sizeType: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  availableSizes: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  fit: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  pattern: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  sleeveType: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  neckType: z.string().trim().max(60).optional().nullable().or(z.literal('')),
  occasion: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  shortDescription: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  fullDescription: z.string().max(20000).optional().nullable().or(z.literal('')),
  videoUrl: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  seoTitle: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  metaDescription: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  keywords: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  canonicalUrl: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  ogImage: z.string().trim().max(500).optional().nullable().or(z.literal('')),
  weight: z.coerce.number().min(0).optional().nullable(),
  shippingLength: z.coerce.number().min(0).optional().nullable(),
  shippingWidth: z.coerce.number().min(0).optional().nullable(),
  shippingHeight: z.coerce.number().min(0).optional().nullable(),
  shippingClass: z.string().trim().max(120).optional().nullable().or(z.literal('')),
  isNewArrival: z.coerce.boolean().default(false),
  isBestSeller: z.coerce.boolean().default(false),
  isOnSale: z.coerce.boolean().default(false),
  isDraft: z.coerce.boolean().default(false),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
