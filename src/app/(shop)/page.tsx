import Link from 'next/link';
import { Hero } from '@/components/layout/hero';
import { ProductGrid } from '@/components/product/product-grid';
import { getFeaturedProducts } from '@/server/products';

const departments = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Kids', href: '/kids' },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);

  return (
    <main>
      <Hero />

      {/* Department cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3">
        {departments.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="group flex h-56 items-center justify-center border border-muted bg-background text-4xl font-semibold uppercase tracking-widest text-text-primary transition-colors duration-instant hover:bg-surface-base hover:text-text-tertiary focus-visible:bg-surface-base focus-visible:text-text-tertiary"
          >
            {d.label}
          </Link>
        ))}
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-4xl font-semibold uppercase tracking-tight">
            Featured
          </h2>
          <Link
            href="/shop"
            className="text-xl uppercase tracking-wide text-text-primary underline"
          >
            View all
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </main>
  );
}
