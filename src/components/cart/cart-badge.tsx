'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useGuestCart } from '@/store/guest-cart';
import { cn } from '@/lib/utils';

/**
 * Cart icon with item-count badge.
 * - Authenticated: uses `dbCount` from the server.
 * - Guest: reads the localStorage cart reactively.
 * `light` renders a white icon (for transparent-over-hero navbar).
 */
export function CartBadge({
  isAuthenticated,
  dbCount,
  light = false,
}: {
  isAuthenticated: boolean;
  dbCount: number;
  light?: boolean;
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
      className={cn(
        'relative p-2.5 transition-colors duration-fast',
        light ? 'text-white hover:text-white/75' : 'text-foreground hover:text-accent',
      )}
    >
      <ShoppingBag size={40} />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-lg bg-accent text-[10px] font-medium text-accent-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
