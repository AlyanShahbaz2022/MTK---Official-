'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGuestCart } from '@/store/guest-cart';
import { mergeGuestCart } from '@/server/actions/cart';

/**
 * On transition to an authenticated session, merge any guest-cart items into
 * the user's DB cart, then clear local storage. Runs once per login.
 */
export function CartMerge() {
  const { status } = useSession();
  const router = useRouter();
  const merged = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || merged.current) return;

    const items = useGuestCart.getState().items;
    if (items.length === 0) {
      merged.current = true;
      return;
    }

    merged.current = true;
    void mergeGuestCart({
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    }).then((res) => {
      if (res.ok) {
        useGuestCart.getState().clear();
        router.refresh();
      }
    });
  }, [status, router]);

  return null;
}
