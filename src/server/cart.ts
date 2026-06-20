import 'server-only';
import { prisma } from '@/lib/prisma';

/** Variant + product info needed to render a cart/wishlist line. */
const variantSelect = {
  id: true,
  size: true,
  color: true,
  stock: true,
  priceOverride: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      images: {
        select: { url: true, alt: true },
        orderBy: { position: 'asc' },
        take: 1,
      },
    },
  },
} as const;

export interface CartLine {
  itemId: string;
  variantId: string;
  quantity: number;
  size: string;
  color: string;
  stock: number;
  unitPrice: number; // minor units
  lineTotal: number; // minor units
  name: string;
  slug: string;
  image?: { url: string; alt: string };
}

export interface CartView {
  lines: CartLine[];
  itemCount: number;
  subtotal: number; // minor units
}

const EMPTY: CartView = { lines: [], itemCount: 0, subtotal: 0 };

/** Resolve the effective unit price for a variant (override or base). */
export function unitPrice(v: {
  priceOverride: number | null;
  product: { basePrice: number };
}): number {
  return v.priceOverride ?? v.product.basePrice;
}

/** Get (or lazily create) the user's cart as a view model with totals. */
export async function getCart(userId: string): Promise<CartView> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
        include: { variant: { select: variantSelect } },
      },
    },
  });

  if (!cart || cart.items.length === 0) return EMPTY;

  const lines: CartLine[] = cart.items.map((item) => {
    const v = item.variant;
    const price = unitPrice(v);
    // Clamp displayed qty to available stock (defensive).
    const qty = Math.min(item.quantity, v.stock);
    return {
      itemId: item.id,
      variantId: v.id,
      quantity: item.quantity,
      size: v.size,
      color: v.color,
      stock: v.stock,
      unitPrice: price,
      lineTotal: price * qty,
      name: v.product.name,
      slug: v.product.slug,
      image: v.product.images[0],
    };
  });

  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.lineTotal, 0),
  };
}

/** Lightweight item count for the header badge. */
export async function getCartCount(userId: string): Promise<number> {
  const result = await prisma.cartItem.aggregate({
    where: { cart: { userId } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

/** Wishlist view (variants the user saved). */
export async function getWishlist(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: 'desc' },
        include: { variant: { select: variantSelect } },
      },
    },
  });
  return wishlist?.items ?? [];
}
