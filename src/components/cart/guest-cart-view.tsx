'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useGuestCart } from '@/store/guest-cart';
import { CartSummary } from '@/components/cart/cart-summary';
import { EmptyCart } from '@/components/cart/empty-cart';

/** Cart view for logged-out users, backed by localStorage (Zustand). */
export function GuestCartView() {
  // Avoid hydration mismatch: only render store contents after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useGuestCart((s) => s.items);
  const setQty = useGuestCart((s) => s.setQty);
  const remove = useGuestCart((s) => s.remove);

  if (!mounted) return null;
  if (items.length === 0) return <EmptyCart />;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <p className="mb-5 rounded-xs bg-muted px-7 py-5 text-lg text-text-primary">
          You&apos;re shopping as a guest.{' '}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>{' '}
          to save your cart.
        </p>
        {items.map((i) => (
          <div
            key={i.variantId}
            className="flex gap-6 border-b border-text-primary/10 py-6"
          >
            <Link
              href={`/product/${i.slug}`}
              className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-muted"
            >
              {i.image && (
                <Image
                  src={i.image}
                  alt={i.name}
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
                    href={`/product/${i.slug}`}
                    className="text-2xl font-medium text-text-primary hover:underline"
                  >
                    {i.name}
                  </Link>
                  <p className="mt-1 text-md uppercase tracking-widest text-muted-foreground">
                    {i.color} · {i.size}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i.variantId)}
                  aria-label="Remove item"
                  className="p-2 text-muted-foreground hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(i.variantId, i.quantity - 1)}
                    aria-label="Decrease quantity"
                    className="flex size-9 items-center justify-center rounded-xs border border-text-primary/20 hover:border-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="min-w-8 text-center text-xl">
                    {i.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(i.variantId, i.quantity + 1)}
                    disabled={i.quantity >= i.maxStock}
                    aria-label="Increase quantity"
                    className="flex size-9 items-center justify-center rounded-xs border border-text-primary/20 hover:border-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
                <p className="text-xl font-medium text-text-primary">
                  {formatPrice(i.unitPrice * i.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CartSummary subtotal={subtotal} itemCount={itemCount} />
    </div>
  );
}
