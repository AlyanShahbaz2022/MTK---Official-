'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

type Gender = 'WOMEN' | 'MEN' | 'KIDS';

interface NewProduct {
  id: string;
  title: string;
  price: number;
  original?: number;
  badge?: string;
  image: string;
  gender: Gender;
}

const products: NewProduct[] = [
  { id: 'n1', title: 'Pinkish-Grey Blended Lawn Suit', price: 6990, original: 9320, badge: '-25%', image: '/images/cat-women.jpg', gender: 'WOMEN' },
  { id: 'n2', title: 'Embroidered Festive Three-Piece', price: 12800, badge: 'New', image: '/images/editorial.jpg', gender: 'WOMEN' },
  { id: 'n3', title: 'Champagne Khaddar Unstitched', price: 4800, original: 5800, badge: '-17%', image: '/images/hero.jpg', gender: 'WOMEN' },
  { id: 'n4', title: 'Ivory Chiffon Luxury Pret', price: 18500, badge: 'New', image: '/images/women 1.webp', gender: 'WOMEN' },
  { id: 'n5', title: 'Rust Embroidered Lawn', price: 7200, original: 8500, badge: '-15%', image: '/images/hero banner.webp', gender: 'WOMEN' },
  { id: 'm1', title: 'Classic Cotton Kurta Shalwar', price: 3200, badge: 'New', image: '/images/cat-men.jpg', gender: 'MEN' },
  { id: 'm2', title: 'Navy Wash & Wear Two-Piece', price: 4500, original: 5600, badge: '-20%', image: '/images/Men 1.webp', gender: 'MEN' },
  { id: 'm3', title: 'Charcoal Premium Kameez', price: 5200, badge: 'New', image: '/images/herror banner 4.webp', gender: 'MEN' },
  { id: 'm4', title: 'Beige Linen Casual Shirt', price: 3800, original: 4400, badge: '-14%', image: '/images/cat-men.jpg', gender: 'MEN' },
  { id: 'k1', title: 'Kids Mustard Embroidered Kurta', price: 2100, badge: 'New', image: '/images/cat-kids.jpg', gender: 'KIDS' },
  { id: 'k2', title: 'Kids Printed Festive Set', price: 2600, original: 3200, badge: '-19%', image: '/images/cat-kids.jpg', gender: 'KIDS' },
  { id: 'k3', title: 'Kids Pastel Lawn Frock', price: 2400, badge: 'New', image: '/images/editorial.jpg', gender: 'KIDS' },
];

const tabs: Gender[] = ['WOMEN', 'MEN', 'KIDS'];

const pkr = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

export function NewIn() {
  const [active, setActive] = useState<Gender>('WOMEN');
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const list = products.filter((p) => p.gender === active);

  function toggleSave(id: string) {
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 sm:py-20 md:px-10 md:py-28">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-medium uppercase tracking-[0.12em] text-foreground sm:text-4xl md:text-5xl">
          New In
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          Unmatched design — superior performance and customer satisfaction in one.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex items-center justify-center gap-x-8 border-b border-primary/10">
        <div className="flex flex-1 items-center justify-center gap-x-8">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                'relative pb-4 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-fast',
                active === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
              {active === t && (
                <span className="absolute -bottom-px left-0 h-0.5 w-full bg-accent" />
              )}
            </button>
          ))}
        </div>
        <Link
          href={`/${active.toLowerCase()}`}
          className="hidden pb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-accent hover:text-foreground sm:block"
        >
          See All
        </Link>
      </div>

      {/* Carousel — thumb-swipeable, no arrows */}
      <div className="relative mt-10">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((p) => (
            <article
              key={p.id}
              className="group w-full shrink-0 snap-start px-[10px] sm:w-1/2 md:w-1/3 lg:w-1/4"
            >
              <Link href={`/${p.gender.toLowerCase()}`} className="relative block aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="270px"
                  className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-3 top-3 rounded-sm bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    {p.badge}
                  </span>
                )}
              </Link>

              <div className="mt-5 text-center">
                <h3 className="truncate px-2 text-[13px] font-medium uppercase tracking-wide text-foreground">
                  {p.title}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-[15px] font-semibold text-foreground">{pkr(p.price)}</span>
                  {p.original && (
                    <span className="text-[13px] text-muted-foreground line-through">
                      {pkr(p.original)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Add to wishlist"
                    onClick={() => toggleSave(p.id)}
                    className={cn(
                      'flex size-12 items-center justify-center rounded-full border transition-colors duration-fast',
                      saved.has(p.id)
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-primary/25 text-foreground hover:border-primary hover:text-accent',
                    )}
                  >
                    <Heart className={cn('size-6', saved.has(p.id) && 'fill-current')} />
                  </button>
                  <Link
                    href={`/${p.gender.toLowerCase()}`}
                    aria-label="Quick view"
                    className="flex size-12 items-center justify-center rounded-full border border-primary/25 text-foreground transition-colors duration-fast hover:border-primary hover:text-accent"
                  >
                    <Eye className="size-6" />
                  </Link>
                  <Link
                    href={`/${p.gender.toLowerCase()}`}
                    aria-label="Shop"
                    className="flex size-12 items-center justify-center rounded-full border border-primary/25 text-foreground transition-colors duration-fast hover:border-primary hover:text-accent"
                  >
                    <ShoppingBag className="size-6" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
