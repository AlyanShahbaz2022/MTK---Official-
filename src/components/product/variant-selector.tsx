'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ProductVariant } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGuestCart } from '@/store/guest-cart';
import { addToCart } from '@/server/actions/cart';
import { addToWishlist } from '@/server/actions/wishlist';

interface Props {
  variants: ProductVariant[];
  basePrice: number;
  product: {
    name: string;
    slug: string;
    image?: string;
  };
}

/** Size/color selector with functional add-to-cart and wishlist (Phase 4). */
export function VariantSelector({ variants, basePrice, product }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const guestCart = useGuestCart();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color))],
    [variants],
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants],
  );

  const [color, setColor] = useState(colors[0] ?? '');
  const [size, setSize] = useState(sizes[0] ?? '');

  const selected = variants.find((v) => v.color === color && v.size === size);
  const price = selected?.priceOverride ?? basePrice;
  const inStock = (selected?.stock ?? 0) > 0;

  function sizeInStock(s: string) {
    const v = variants.find((x) => x.color === color && x.size === s);
    return (v?.stock ?? 0) > 0;
  }

  function handleAddToCart() {
    if (!selected) return;
    setMessage(null);

    if (status === 'authenticated') {
      startTransition(async () => {
        const res = await addToCart({ variantId: selected.id, quantity: 1 });
        if (res.error) setMessage({ ok: false, text: res.error });
        else {
          setMessage({ ok: true, text: 'Added to cart' });
          router.refresh();
        }
      });
    } else {
      // Guest: add to localStorage cart.
      guestCart.add({
        variantId: selected.id,
        quantity: 1,
        name: product.name,
        slug: product.slug,
        size: selected.size,
        color: selected.color,
        unitPrice: price,
        image: product.image,
        maxStock: selected.stock,
      });
      setMessage({ ok: true, text: 'Added to cart' });
    }
  }

  function handleAddToWishlist() {
    if (!selected) return;
    setMessage(null);
    if (status !== 'authenticated') {
      router.push('/login?callbackUrl=/product/' + product.slug);
      return;
    }
    startTransition(async () => {
      const res = await addToWishlist({ variantId: selected.id });
      if (res.error) setMessage({ ok: false, text: res.error });
      else setMessage({ ok: true, text: 'Saved to wishlist' });
    });
  }

  return (
    <div className="space-y-7">
      <p className="text-3xl font-medium text-text-primary">
        {formatPrice(price)}
      </p>

      {/* Color */}
      <div className="space-y-4">
        <p className="text-md uppercase tracking-widest text-muted-foreground">
          Color: <span className="text-text-primary">{color}</span>
        </p>
        <div className="flex flex-wrap gap-4">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-11 rounded-xs border px-7 text-lg transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                c === color
                  ? 'border-text-primary bg-text-primary text-text-tertiary'
                  : 'border-text-primary/20 text-text-primary hover:border-text-primary',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-4">
        <p className="text-md uppercase tracking-widest text-muted-foreground">
          Size: <span className="text-text-primary">{size}</span>
        </p>
        <div className="flex flex-wrap gap-4">
          {sizes.map((s) => {
            const available = sizeInStock(s);
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                className={cn(
                  'h-11 min-w-11 rounded-xs border px-6 text-lg transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40',
                  s === size
                    ? 'border-text-primary bg-text-primary text-text-tertiary'
                    : 'border-text-primary/20 text-text-primary hover:border-text-primary',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-5">
        <Button
          size="lg"
          className="flex-1"
          disabled={!inStock || isPending}
          onClick={handleAddToCart}
        >
          {!inStock ? 'Out of stock' : isPending ? 'Adding…' : 'Add to cart'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label="Save to wishlist"
          disabled={isPending}
          onClick={handleAddToWishlist}
        >
          <Heart className="size-5" />
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            'text-lg',
            message.ok ? 'text-text-primary' : 'text-red-600',
          )}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
