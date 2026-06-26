'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { moveToCart, removeWishlistItem } from '@/server/actions/wishlist';

interface Props {
  itemId: string;
  name: string;
  slug: string;
  size: string;
  color: string;
  unitPrice: number;
  inStock: boolean;
  image?: { url: string; alt: string };
}

export function WishlistItem(props: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        'flex gap-6 border-b border-primary/10 py-8',
        isPending && 'opacity-60',
      )}
    >
      <Link
        href={`/product/${props.slug}`}
        className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-muted"
      >
        {props.image && (
          <Image
            src={props.image.url}
            alt={props.image.alt}
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
              href={`/product/${props.slug}`}
              className="font-display text-xl tracking-tight text-foreground transition-colors duration-fast hover:text-accent md:text-2xl"
            >
              {props.name}
            </Link>
            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {props.color} · Size {props.size}
            </p>
            <p className="mt-3 text-base font-medium text-foreground">
              {formatPrice(props.unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await removeWishlistItem({ itemId: props.itemId });
              })
            }
            disabled={isPending}
            aria-label="Remove from wishlist"
            className="p-2 text-muted-foreground transition-colors duration-fast hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isPending || !props.inStock}
          onClick={() =>
            startTransition(async () => {
              await moveToCart({ itemId: props.itemId });
            })
          }
        >
          {props.inStock ? 'Move to bag' : 'Out of stock'}
        </Button>
      </div>
    </div>
  );
}
