import 'server-only';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';

/** Generate a unique human-friendly order number like MTK-4F9A2C. */
export async function generateOrderNumber(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const suffix = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
    const code = `MTK-${suffix}`;
    const existing = await prisma.order.findUnique({
      where: { orderNumber: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  // Extremely unlikely fallback.
  return `MTK-${Date.now().toString(36).toUpperCase()}`;
}

export interface CouponResult {
  ok: boolean;
  error?: string;
  coupon?: { id: string; code: string };
  discount?: number; // minor units
}

/**
 * Validate a coupon against a subtotal (read-only — does NOT increment usage).
 * Redemption is incremented atomically inside placeOrder's transaction.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: 'Enter a coupon code.' };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: 'This coupon is not valid.' };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= Date.now()) {
    return { ok: false, error: 'This coupon has expired.' };
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.timesRedeemed >= coupon.maxRedemptions
  ) {
    return { ok: false, error: 'This coupon is no longer available.' };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `Spend more to use this coupon (minimum order required).`,
    };
  }

  const discount =
    coupon.type === 'PERCENT'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    ok: true,
    coupon: { id: coupon.id, code: coupon.code },
    discount,
  };
}

/** All orders for a user, newest first, with item thumbnails. */
export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { id: true, productName: true, image: true, quantity: true },
      },
    },
  });
}

/** A single order owned by the user (or null). */
export async function getUserOrder(userId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { userId, orderNumber },
    include: { items: true },
  });
}
