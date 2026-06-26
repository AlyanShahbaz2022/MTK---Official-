'use client';

import { useEffect, useState } from 'react';
import { MiniProductCard, type MiniProduct } from '@/components/product/mini-product-card';

const KEY = 'mtk-recently-viewed';
const MAX = 8;

/**
 * Records the current product in localStorage and renders the rest as
 * "Recently Viewed". Runs entirely client-side (no backend).
 */
export function RecentlyViewed({ current }: { current: MiniProduct }) {
  const [items, setItems] = useState<MiniProduct[]>([]);

  useEffect(() => {
    let stored: MiniProduct[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch {
      stored = [];
    }

    // Show everything previously viewed except the current product.
    setItems(stored.filter((p) => p.slug !== current.slug).slice(0, MAX));

    // Prepend current, dedupe, cap, and persist for next time.
    const next = [current, ...stored.filter((p) => p.slug !== current.slug)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-primary/10">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium uppercase tracking-[0.12em] text-foreground md:text-4xl">
            Recently Viewed Products
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pick up where you left off.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, 4).map((p) => (
            <MiniProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
