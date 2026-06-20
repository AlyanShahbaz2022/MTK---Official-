import { ProductCard } from '@/components/product/product-card';
import { Reveal } from '@/components/motion/reveal';
import type { ProductCard as ProductCardData } from '@/server/products';

/** "You may also like" — related products grid. */
export function RelatedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-primary/10">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-20">
        <Reveal className="mb-10 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
            Complete the look
          </span>
          <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            You may also like
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-4 lg:gap-x-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
