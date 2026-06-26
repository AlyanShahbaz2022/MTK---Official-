'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { CartLine as CartLineData } from '@/server/cart';
import { updateCartItemQty, removeCartItem } from '@/server/actions/cart';

/** A single DB-cart row with qty controls + remove (authenticated users). */
export function CartLine({ line }: { line: CartLineData }) {
  const [isPending, startTransition] = useTransition();

  function setQty(quantity: number) {
    startTransition(async () => {
      await updateCartItemQty({ itemId: line.itemId, quantity });
    });
  }
  function remove() {
    startTransition(async () => {
      await removeCartItem({ itemId: line.itemId });
    });
  }

  const atMax = line.quantity >= line.stock;

  return (
    <div
      className={cn(
        'flex gap-6 border-b border-primary/10 py-8',
        isPending && 'opacity-60',
      )}
    >
      <Link
        href={`/product/${line.slug}`}
        className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-muted"
      >
        {line.image && (
          <Image
            src={line.image.url}
            alt={line.image.alt}
            fill
            sizes="112px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/product/${line.slug}`}
              className="font-display text-xl tracking-tight text-foreground transition-colors duration-fast hover:text-accent md:text-2xl"
            >
              {line.name}
            </Link>
            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {line.color} · Size {line.size}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            aria-label="Remove item"
            className="p-2 text-muted-foreground transition-colors duration-fast hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center border border-primary/20">
            <button
              type="button"
              onClick={() => setQty(line.quantity - 1)}
              disabled={isPending}
              aria-label="Decrease quantity"
              className="flex size-10 items-center justify-center text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-9 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              onClick={() => setQty(line.quantity + 1)}
              disabled={isPending || atMax}
              aria-label="Increase quantity"
              className="flex size-10 items-center justify-center text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="text-base font-medium text-foreground">
            {formatPrice(line.lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
