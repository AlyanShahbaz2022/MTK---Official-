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
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="mb-6 border border-primary/10 bg-muted/40 px-7 py-4 text-sm text-foreground">
          You&apos;re shopping as a guest.{' '}
          <Link href="/login" className="font-medium text-accent underline underline-offset-4">
            Sign in
          </Link>{' '}
          to save your bag.
        </p>
        <div className="border-t border-primary/10">
          {items.map((i) => (
            <div
              key={i.variantId}
              className="flex gap-6 border-b border-primary/10 py-8"
            >
              <Link
                href={`/product/${i.slug}`}
                className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-muted"
              >
                {i.image && (
                  <Image src={i.image} alt={i.name} fill sizes="112px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/product/${i.slug}`}
                      className="font-display text-xl tracking-tight text-foreground transition-colors duration-fast hover:text-accent md:text-2xl"
                    >
                      {i.name}
                    </Link>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {i.color} · Size {i.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i.variantId)}
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
                      onClick={() => setQty(i.variantId, i.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex size-10 items-center justify-center text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-9 text-center text-sm">{i.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQty(i.variantId, i.quantity + 1)}
                      disabled={i.quantity >= i.maxStock}
                      aria-label="Increase quantity"
                      className="flex size-10 items-center justify-center text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-base font-medium text-foreground">
                    {formatPrice(i.unitPrice * i.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CartSummary subtotal={subtotal} itemCount={itemCount} />
    </div>
  );
}
