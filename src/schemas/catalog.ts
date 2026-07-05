import { z } from 'zod';

/** Catalog listing filters — parsed from URL search params (untrusted input). */
export const sortOptions = [
  'newest',
  'price-asc',
  'price-desc',
  'rating',
] as const;
export type SortOption = (typeof sortOptions)[number];

export const productFiltersSchema = z.object({
  category: z.string().trim().optional(),
  sub: z.string().trim().optional(),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  // Prices in rupees from the UI; converted to paisa in the query layer.
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(sortOptions).default('newest'),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;

/** Safely parse raw search params, falling back to defaults on bad input. */
export function parseProductFilters(
  raw: Record<string, string | string[] | undefined>,
): ProductFilters {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }
  const result = productFiltersSchema.safeParse(flat);
  return result.success ? result.data : productFiltersSchema.parse({});
}
