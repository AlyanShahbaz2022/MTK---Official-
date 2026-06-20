'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useGuestCart } from '@/store/guest-cart';

/**
 * Cart icon with item-count badge.
 * - Authenticated: uses `dbCount` from the server.
 * - Guest: reads the localStorage cart reactively.
 */
export function CartBadge({
  isAuthenticated,
  dbCount,
}: {
  isAuthenticated: boolean;
  dbCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const guestCount = useGuestCart((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  const count = isAuthenticated ? dbCount : mounted ? guestCount : 0;

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      id="cart-fly-target"
      className="relative p-2 text-foreground transition-colors duration-fast hover:text-accent"
    >
      <ShoppingBag className="size-8" />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-lg bg-accent text-[10px] font-medium text-accent-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
