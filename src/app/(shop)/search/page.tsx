import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product/product-grid';
import { SearchBox } from '@/components/product/search-box';
import { parseProductFilters } from '@/schemas/catalog';
import { getProducts } from '@/server/products';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseProductFilters(raw);

  const hasQuery = !!filters.q;
  const { products, total } = hasQuery
    ? await getProducts(filters)
    : { products: [], total: 0 };

  return (
    <main className="mx-auto max-w-7xl px-8 py-8">
      <h1 className="mb-7 text-4xl font-semibold uppercase tracking-tight">
        Search
      </h1>

      <div className="mb-8 max-w-xl">
        <SearchBox initialQuery={filters.q ?? ''} />
      </div>

      {hasQuery && (
        <>
          <p className="mb-7 text-lg text-muted-foreground">
            {total} result{total === 1 ? '' : 's'} for &ldquo;{filters.q}&rdquo;
          </p>
          <ProductGrid products={products} />
        </>
      )}
    </main>
  );
}
