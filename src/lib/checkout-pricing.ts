/**
 * Shared checkout pricing rules (client + server). NOT server-only — the
 * checkout form imports these to show live totals, and the server recomputes
 * the same values authoritatively before placing an order.
 *
 * All amounts are in minor units (paisa).
 */

// Orders at/above this subtotal ship free.
export const FREE_SHIPPING_THRESHOLD = 1_000_000; // Rs 10,000

export type DeliveryMethodId = 'standard' | 'express';

export const DELIVERY_METHODS: Record<
  DeliveryMethodId,
  { label: string; note: string; cost: number }
> = {
  standard: {
    label: 'Standard',
    note: '3–5 business days',
    cost: 25_000, // Rs 250
  },
  express: {
    label: 'Express',
    note: '1–2 business days',
    cost: 60_000, // Rs 600
  },
};

/** Shipping cost for a method, waived when the subtotal qualifies for free shipping. */
export function computeShipping(
  method: DeliveryMethodId,
  subtotal: number,
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return DELIVERY_METHODS[method]?.cost ?? DELIVERY_METHODS.standard.cost;
}
