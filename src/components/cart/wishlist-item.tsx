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
        'flex gap-6 border-b border-text-primary/10 py-6',
        isPending && 'opacity-60',
      )}
    >
      <Link
        href={`/product/${props.slug}`}
        className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-muted"
      >
        {props.image && (
          <Image
            src={props.image.url}
            alt={props.image.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/product/${props.slug}`}
              className="text-2xl font-medium text-text-primary hover:underline"
            >
              {props.name}
            </Link>
            <p className="mt-1 text-md uppercase tracking-widest text-muted-foreground">
              {props.color} · {props.size}
            </p>
            <p className="mt-2 text-xl font-medium">
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
            className="p-2 text-muted-foreground hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          {props.inStock ? 'Move to cart' : 'Out of stock'}
        </Button>
      </div>
    </div>
  );
}
