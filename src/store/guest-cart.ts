'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestCartItem {
  variantId: string;
  quantity: number;
  // Display snapshot (so the guest cart renders without a DB round-trip).
  name: string;
  slug: string;
  size: string;
  color: string;
  unitPrice: number; // minor units
  image?: string;
  maxStock: number;
}

interface GuestCartState {
  items: GuestCartItem[];
  add: (item: GuestCartItem) => void;
  setQty: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  count: () => number;
}

/**
 * Guest (logged-out) cart, persisted to localStorage. On login it's merged
 * into the DB cart via mergeGuestCart() and then cleared.
 */
export const useGuestCart = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + item.quantity,
                        item.maxStock,
                      ),
                    }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      setQty: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i,
                ),
        })),
      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: 'mtk-guest-cart' },
  ),
);
