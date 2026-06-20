import type { Gender } from '@prisma/client';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFiltersBar } from '@/components/product/product-filters';
import { Pagination } from '@/components/product/pagination';
import { Reveal } from '@/components/motion/reveal';
import { parseProductFilters } from '@/schemas/catalog';
import { getProducts, getFilterOptions } from '@/server/products';

interface Props {
  title: string;
  subtitle?: string;
  gender?: Gender;
  basePath: string;
  rawSearchParams: Record<string, string | string[] | undefined>;
}

/** Shared listing view used by /shop, /men, /women, /kids. */
export async function ProductListing({
  title,
  subtitle,
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
    <main className="mx-auto max-w-screen-2xl px-6 py-14 md:px-10 md:py-20">
      {/* Page header */}
      <Reveal className="mb-10 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Collection
        </span>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {subtitle ?? `${total} ${total === 1 ? 'piece' : 'pieces'}`}
        </p>
      </Reveal>

      <div className="mb-10">
        <ProductFiltersBar sizes={options.sizes} colors={options.colors} />
      </div>

      <Reveal delay={0.05}>
        <ProductGrid products={products} basePath={basePath} />
      </Reveal>

      <Pagination
        page={filters.page}
        pageCount={pageCount}
        searchParams={flat}
        basePath={basePath}
      />
    </main>
  );
}
