'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ProductVariant } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, Check, RotateCcw, Truck, ShieldCheck } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useGuestCart } from '@/store/guest-cart';
import { addToCart } from '@/server/actions/cart';
import { addToWishlist } from '@/server/actions/wishlist';
import { flyToCart } from '@/lib/fly-to-cart';

interface Props {
  variants: ProductVariant[];
  basePrice: number;
  fabric?: string;
  product: { name: string; slug: string; image?: string };
}

const COLOR_HEX: Record<string, string> = {
  white: '#f5f5f5', 'off white': '#efe9df', black: '#111111', beige: '#d8c4a5',
  blue: '#3b5b8c', navy: '#26314f', maroon: '#6e1f2b', teal: '#1f6e6a',
  yellow: '#e3b341', floral: '#c98a9a', red: '#9b2230', green: '#3c6b46', pink: '#d98aa6',
};
const swatch = (c: string) => COLOR_HEX[c.toLowerCase()] ?? '#bcae9a';

const trust = [
  { icon: RotateCcw, label: '30 Days Easy Replace' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: ShieldCheck, label: 'Secure Checkout' },
];

export function VariantSelector({ variants, basePrice, fabric, product }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const guestCart = useGuestCart();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [qty, setQty] = useState(1);

  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);

  const [color, setColor] = useState(colors[0] ?? '');
  const [size, setSize] = useState(sizes[0] ?? '');

  const selected = variants.find((v) => v.color === color && v.size === size);
  const price = selected?.priceOverride ?? basePrice;
  const stock = selected?.stock ?? 0;
  const inStock = stock > 0;

  const sizeInStock = (s: string) =>
    (variants.find((x) => x.color === color && x.size === s)?.stock ?? 0) > 0;

  function addSelected(): boolean {
    if (!selected) return false;
    const quantity = Math.min(qty, stock);
    if (status === 'authenticated') {
      startTransition(async () => {
        const res = await addToCart({ variantId: selected.id, quantity });
        if (res.error) setMessage({ ok: false, text: res.error });
        else {
          if (product.image) flyToCart(product.image);
          setMessage({ ok: true, text: 'Added to your bag' });
          router.refresh();
        }
      });
    } else {
      guestCart.add({
        variantId: selected.id, quantity, name: product.name, slug: product.slug,
        size: selected.size, color: selected.color, unitPrice: price,
        image: product.image, maxStock: stock,
      });
      if (product.image) flyToCart(product.image);
      setMessage({ ok: true, text: 'Added to your bag' });
    }
    return true;
  }

  function handleAddToCart() {
    setMessage(null);
    addSelected();
  }

  function handleBuyNow() {
    setMessage(null);
    if (!selected || !inStock) return;
    if (status === 'authenticated') {
      startTransition(async () => {
        const res = await addToCart({ variantId: selected.id, quantity: Math.min(qty, stock) });
        if (res.error) setMessage({ ok: false, text: res.error });
        else router.push('/checkout');
      });
    } else {
      guestCart.add({
        variantId: selected.id, quantity: Math.min(qty, stock), name: product.name,
        slug: product.slug, size: selected.size, color: selected.color,
        unitPrice: price, image: product.image, maxStock: stock,
      });
      router.push('/checkout');
    }
  }

  function handleWishlist() {
    setMessage(null);
    if (!selected) return;
    if (status !== 'authenticated') {
      router.push('/login?callbackUrl=/product/' + product.slug);
      return;
    }
    startTransition(async () => {
      const res = await addToWishlist({ variantId: selected.id });
      setMessage(res.error ? { ok: false, text: res.error } : { ok: true, text: 'Saved to wishlist' });
    });
  }

  return (
    <div className="space-y-7">
      <p className="font-display text-3xl text-foreground">{formatPrice(price)}</p>

      {/* Fabric + Color */}
      <div className="space-y-4">
        {fabric && (
          <p className="text-sm text-muted-foreground">
            Fabric: <span className="text-foreground">{fabric}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Color: <span className="text-foreground">{color}</span>
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
                <Check className="absolute inset-0 m-auto size-4 text-white mix-blend-difference" strokeWidth={2.5} />
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
            onClick={() => document.getElementById('size-guide')?.scrollIntoView({ behavior: 'smooth' })}
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
                  'relative flex h-11 min-w-11 items-center justify-center border px-5 text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !available && 'cursor-not-allowed border-primary/10 text-muted-foreground/40',
                  available && s === size && 'border-primary bg-primary text-primary-foreground',
                  available && s !== size && 'border-primary/25 text-foreground hover:border-primary',
                )}
              >
                {s}
                {!available && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-full rotate-[-20deg] bg-muted-foreground/40" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Quantity</p>
        <div className="flex w-fit items-center border border-primary/25">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex size-11 items-center justify-center text-foreground hover:text-accent disabled:opacity-30"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-12 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            disabled={qty >= stock}
            className="flex size-11 items-center justify-center text-foreground hover:text-accent disabled:opacity-30"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* SKU & Availability */}
      <div className="flex flex-wrap gap-x-8 gap-y-1 border-y border-primary/10 py-4 text-[12px] text-muted-foreground">
        {selected?.sku && <span>SKU: <span className="text-foreground">{selected.sku}</span></span>}
        <span>
          Availability:{' '}
          <span className={inStock ? 'text-green-700' : 'text-red-600'}>
            {inStock ? (stock <= 5 ? `Only ${stock} left` : 'In Stock') : 'Out of Stock'}
          </span>
        </span>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || isPending}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'flex-1')}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock || isPending}
          className={cn(buttonVariants({ variant: 'accent', size: 'lg' }), 'flex-1')}
        >
          Buy It Now
        </button>
        <button
          type="button"
          onClick={handleWishlist}
          disabled={isPending}
          aria-label="Save to wishlist"
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/25 text-foreground transition-colors duration-fast hover:border-primary hover:text-accent"
        >
          <Heart className="size-5" />
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={cn('flex items-center gap-2 text-sm', message.ok ? 'text-foreground' : 'text-red-600')}
        >
          {message.ok && <Check className="size-4 text-accent" />}
          {message.text}
        </p>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 border-t border-primary/10 pt-7">
        {trust.map((t) => (
          <div key={t.label} className="flex flex-col items-center gap-2 text-center">
            <t.icon className="size-6 text-accent" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
