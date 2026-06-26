'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MiniProductCard, type MiniProduct } from '@/components/product/mini-product-card';

/** 4-up product carousel with edge arrows (paged by container width). */
export function YouMayAlsoLike({ products }: { products: MiniProduct[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;

  function scroll(dir: -1 | 1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  }

  return (
    <section className="border-t border-primary/10">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium uppercase tracking-[0.12em] text-foreground md:text-4xl">
            You May Also Like
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pieces selected to complement your style.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scroll(-1)}
            className="absolute -left-3 top-[30%] z-10 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-background text-foreground shadow-md transition-colors hover:border-primary hover:text-accent md:-left-6"
          >
            <ChevronLeft className="size-7" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scroll(1)}
            className="absolute -right-3 top-[30%] z-10 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-background text-foreground shadow-md transition-colors hover:border-primary hover:text-accent md:-right-6"
          >
            <ChevronRight className="size-7" />
          </button>

          <div
            ref={scroller}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((p) => (
              <div
                key={p.slug}
                className="w-full shrink-0 snap-start px-[10px] sm:w-1/2 md:w-1/3 lg:w-1/4"
              >
                <MiniProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
