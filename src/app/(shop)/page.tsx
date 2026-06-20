import Link from 'next/link';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { ServiceStrip } from '@/components/home/service-strip';
import { CategoryShowcase } from '@/components/home/category-showcase';
import { BrandStatement } from '@/components/home/brand-statement';
import { EditorialSplit } from '@/components/home/editorial-split';
import { Reveal } from '@/components/motion/reveal';
import { ProductGrid } from '@/components/product/product-grid';
import { getFeaturedProducts } from '@/server/products';

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);

  return (
    <>
      <BannerCarousel />
      <ServiceStrip />
      <CategoryShowcase />

      {/* Featured products */}
      <section className="mx-auto max-w-screen-2xl px-6 pb-24 md:px-10">
        <Reveal className="mb-12 flex flex-col items-center text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
            Curated for you
          </span>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Featured pieces
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ProductGrid products={featured} />
        </Reveal>
        <Reveal delay={0.15} className="mt-12 text-center">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.25em] text-foreground underline decoration-accent decoration-1 underline-offset-8 transition-colors duration-fast hover:text-accent"
          >
            View all products
          </Link>
        </Reveal>
      </section>

      <BrandStatement />
      <EditorialSplit />
    </>
  );
}
