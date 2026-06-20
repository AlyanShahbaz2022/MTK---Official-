'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ProductVariant } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, Check, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGuestCart } from '@/store/guest-cart';
import { addToCart } from '@/server/actions/cart';
import { addToWishlist } from '@/server/actions/wishlist';
import { flyToCart } from '@/lib/fly-to-cart';

interface Props {
  variants: ProductVariant[];
  basePrice: number;
  product: { name: string; slug: string; image?: string };
}

// Map common color names to a swatch hex (fallback handled below).
const COLOR_HEX: Record<string, string> = {
  white: '#f5f5f5',
  black: '#111111',
  beige: '#d8c4a5',
  blue: '#3b5b8c',
  navy: '#26314f',
  maroon: '#6e1f2b',
  teal: '#1f6e6a',
  yellow: '#e3b341',
  floral: '#c98a9a',
  red: '#9b2230',
  green: '#3c6b46',
  pink: '#d98aa6',
};

function swatch(color: string): string {
  return COLOR_HEX[color.toLowerCase()] ?? '#bcae9a';
}

export function VariantSelector({ variants, basePrice, product }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const guestCart = useGuestCart();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [qty, setQty] = useState(1);

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
  const stock = selected?.stock ?? 0;
  const inStock = stock > 0;

  function sizeInStock(s: string) {
    const v = variants.find((x) => x.color === color && x.size === s);
    return (v?.stock ?? 0) > 0;
  }

  function handleAddToCart() {
    if (!selected) return;
    setMessage(null);
    const quantity = Math.min(qty, stock);

    const onSuccess = () => {
      if (product.image) flyToCart(product.image);
      setMessage({ ok: true, text: 'Added to your bag' });
    };

    if (status === 'authenticated') {
      startTransition(async () => {
        const res = await addToCart({ variantId: selected.id, quantity });
        if (res.error) setMessage({ ok: false, text: res.error });
        else {
          onSuccess();
          router.refresh();
        }
      });
    } else {
      guestCart.add({
        variantId: selected.id,
        quantity,
        name: product.name,
        slug: product.slug,
        size: selected.size,
        color: selected.color,
        unitPrice: price,
        image: product.image,
        maxStock: stock,
      });
      onSuccess();
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
    <div className="space-y-8">
      <p className="font-display text-3xl text-foreground">{formatPrice(price)}</p>

      {/* Color */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Color — <span className="text-foreground">{color}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              aria-pressed={c === color}
              className={cn(
                'relative size-9 rounded-full border transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                c === color
                  ? 'border-accent ring-1 ring-accent ring-offset-2 ring-offset-background'
                  : 'border-primary/20 hover:border-primary/50',
              )}
              style={{ backgroundColor: swatch(c) }}
            >
              {c === color && (
                <Check
                  className="absolute inset-0 m-auto size-4 text-white mix-blend-difference"
                  strokeWidth={2.5}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Size — <span className="text-foreground">{size}</span>
          </p>
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.15em] text-accent underline underline-offset-4 hover:text-foreground"
            onClick={() =>
              document
                .getElementById('size-guide')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Size guide
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.map((s) => {
            const available = sizeInStock(s);
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                className={cn(
                  'flex h-11 min-w-11 items-center justify-center border px-5 text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-primary/10 disabled:text-muted-foreground/40 disabled:line-through',
                  s === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary/25 text-foreground hover:border-primary',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock status */}
      <p className="text-xs uppercase tracking-[0.15em]">
        {!inStock ? (
          <span className="text-red-600">Out of stock</span>
        ) : stock <= 5 ? (
          <span className="text-accent">Only {stock} left in stock</span>
        ) : (
          <span className="text-green-700">In stock</span>
        )}
      </p>

      {/* Quantity + actions */}
      <div className="flex items-stretch gap-4">
        <div className="flex items-center border border-primary/25">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            disabled={qty >= stock}
            className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button
          size="lg"
          className="flex-1"
          disabled={!inStock || isPending}
          onClick={handleAddToCart}
        >
          {!inStock ? 'Out of stock' : isPending ? 'Adding…' : 'Add to bag'}
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
            'flex items-center gap-2 text-sm',
            message.ok ? 'text-foreground' : 'text-red-600',
          )}
        >
          {message.ok && <Check className="size-4 text-accent" />}
          {message.text}
        </p>
      )}

      {/* Mini assurances */}
      <ul className="space-y-3 border-t border-primary/10 pt-6 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <Truck className="size-4 text-accent" strokeWidth={1.5} />
          Complimentary shipping on orders over Rs 10,000
        </li>
        <li className="flex items-center gap-3">
          <RefreshCw className="size-4 text-accent" strokeWidth={1.5} />
          30-day easy returns &amp; exchanges
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-accent" strokeWidth={1.5} />
          Secure, encrypted checkout
        </li>
      </ul>
    </div>
  );
}
