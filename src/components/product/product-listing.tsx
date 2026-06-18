import type { Gender } from '@prisma/client';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFiltersBar } from '@/components/product/product-filters';
import { Pagination } from '@/components/product/pagination';
import { parseProductFilters } from '@/schemas/catalog';
import { getProducts, getFilterOptions } from '@/server/products';

interface Props {
  title: string;
  gender?: Gender;
  basePath: string;
  rawSearchParams: Record<string, string | string[] | undefined>;
}

/** Shared listing view used by /shop, /men, /women, /kids. */
export async function ProductListing({
  title,
  gender,
  basePath,
  rawSearchParams,
}: Props) {
  const filters = parseProductFilters(rawSearchParams);
  const [{ products, total, pageCount }, options] = await Promise.all([
    getProducts(filters, gender),
    getFilterOptions(gender),
  ]);

  // Flatten for pagination links.
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(rawSearchParams)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <div className="mb-7 flex items-baseline justify-between">
        <h1 className="text-4xl font-semibold uppercase tracking-tight">
          {title}
        </h1>
        <span className="text-lg text-muted-foreground">{total} items</span>
      </div>

      <div className="mb-8">
        <ProductFiltersBar sizes={options.sizes} colors={options.colors} />
      </div>

      <ProductGrid products={products} />

      <Pagination
        page={filters.page}
        pageCount={pageCount}
        searchParams={flat}
        basePath={basePath}
      />
    </main>
  );
}
