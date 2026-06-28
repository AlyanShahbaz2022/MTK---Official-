'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

export interface MiniProduct {
  slug: string;
  name: string;
  price: number; // minor units (paisa)
  original?: number;
  image?: string;
  badge?: string;
}

/** Compact product card with badge, price, and 3 circular action icons. */
export function MiniProductCard({ product }: { product: MiniProduct }) {
  const [saved, setSaved] = useState(false);
  const href = `/product/${product.slug}`;

  return (
    <article className="group">
      <Link href={href} className="relative block aspect-[3/4] overflow-hidden bg-muted">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="270px"
            className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-105"
          />
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-sm bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="mt-5 text-center">
        <h3 className="truncate px-2 text-[13px] font-medium uppercase tracking-wide text-foreground">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[15px] font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.original && (
            <span className="text-[13px] text-muted-foreground line-through">
              {formatPrice(product.original)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={() => setSaved((s) => !s)}
            className={cn(
              'flex size-12 items-center justify-center rounded-full border transition-colors duration-fast',
              saved
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-primary/25 text-foreground hover:border-primary hover:text-accent',
            )}
          >
            <Heart className={cn('size-6', saved && 'fill-current')} />
          </button>
          <Link
            href={href}
            aria-label="Quick view"
            className="flex size-12 items-center justify-center rounded-full border border-primary/25 text-foreground transition-colors duration-fast hover:border-primary hover:text-accent"
          >
            <Eye className="size-6" />
          </Link>
          <Link
            href={href}
            aria-label="Shop"
            className="flex size-12 items-center justify-center rounded-full border border-primary/25 text-foreground transition-colors duration-fast hover:border-primary hover:text-accent"
          >
            <ShoppingBag className="size-6" />
          </Link>
        </div>
      </div>
    </article>
  );
}
