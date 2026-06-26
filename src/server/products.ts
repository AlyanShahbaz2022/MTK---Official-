import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Gender, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductFilters } from '@/schemas/catalog';

export const PAGE_SIZE = 12;

// Cache tag for catalog-derived data (filter options, categories). Revalidate
// these by calling revalidateTag(CATALOG_TAG) after a product/category change.
export const CATALOG_TAG = 'catalog';
const CATALOG_REVALIDATE = 60; // seconds

// Shared shape for product cards/grids.
const listSelect = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  gender: true,
  ratingAvg: true,
  ratingCount: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { position: 'asc' },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof listSelect }>;

function orderBy(
  sort: ProductFilters['sort'],
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { basePrice: 'asc' };
    case 'price-desc':
      return { basePrice: 'desc' };
    case 'rating':
      return { ratingAvg: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

/**
 * List active products with filtering, sorting, and pagination.
 * `gender` scopes a department page (e.g. /men); omit for /shop.
 */
export async function getProducts(
  filters: ProductFilters,
  gender?: Gender,
): Promise<{ products: ProductCard[]; total: number; pageCount: number }> {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (gender) where.gender = gender;
  if (filters.category) where.category = { slug: filters.category };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.basePrice = {
      ...(filters.minPrice != null ? { gte: filters.minPrice * 100 } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice * 100 } : {}),
    };
  }
  // Variant-level filters (size / color).
  if (filters.size || filters.color) {
    where.variants = {
      some: {
        ...(filters.size ? { size: filters.size } : {}),
        ...(filters.color ? { color: filters.color } : {}),
      },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: listSelect,
      orderBy: orderBy(filters.sort),
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Featured products for the home page. */
export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: listSelect,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/** Full product detail by slug (with variants + images). */
export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
    },
  });
}

/**
 * Distinct sizes/colors available (for filter UI). Cached — these change rarely
 * and were previously a DB round-trip on every catalog page load.
 */
export const getFilterOptions = unstable_cache(
  async (gender?: Gender) => {
    const variants = await prisma.productVariant.findMany({
      where: gender ? { product: { gender, isActive: true } } : { product: { isActive: true } },
      select: { size: true, color: true },
    });
    const sizes = [...new Set(variants.map((v) => v.size))].sort();
    const colors = [...new Set(variants.map((v) => v.color))].sort();
    return { sizes, colors };
  },
  ['filter-options'],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE },
);

/** Active categories, optionally scoped to a gender. Cached (rarely changes). */
export const getCategories = unstable_cache(
  async (gender?: Gender) => {
    return prisma.category.findMany({
      where: { isActive: true, ...(gender ? { gender } : {}) },
      select: { id: true, name: true, slug: true, gender: true },
      orderBy: { name: 'asc' },
    });
  },
  ['categories'],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE },
);
