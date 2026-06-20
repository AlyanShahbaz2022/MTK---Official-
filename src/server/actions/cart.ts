'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import {
  addToCartSchema,
  updateQtySchema,
  cartItemRefSchema,
  guestCartSchema,
} from '@/schemas/cart';

export type CartActionState = { error?: string; ok?: boolean };

/** Get or create the current user's cart id. */
async function getOrCreateCartId(userId: string): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
  return cart.id;
}

/**
 * Add a variant to the cart (or increment qty). Validates stock server-side —
 * never trusts the client's price or availability.
 */
export async function addToCart(
  input: unknown,
): Promise<CartActionState> {
  const user = await requireUser();
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };

  const { variantId, quantity } = parsed.data;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true },
  });
  if (!variant) return { error: 'Product not found.' };
  if (variant.stock < 1) return { error: 'Out of stock.' };

  const cartId = await getOrCreateCartId(user.id);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
    select: { quantity: true },
  });

  const desired = (existing?.quantity ?? 0) + quantity;
  if (desired > variant.stock) {
    return { error: `Only ${variant.stock} in stock.` };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: desired },
    create: { cartId, variantId, quantity },
  });

  revalidatePath('/cart');
  return { ok: true };
}

/** Update a line quantity (0 removes it). */
export async function updateCartItemQty(
  input: unknown,
): Promise<CartActionState> {
  const user = await requireUser();
  const parsed = updateQtySchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };
  const { itemId, quantity } = parsed.data;

  // Ownership check + stock fetch.
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
    select: { id: true, variant: { select: { stock: true } } },
  });
  if (!item) return { error: 'Item not found.' };

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    if (quantity > item.variant.stock) {
      return { error: `Only ${item.variant.stock} in stock.` };
    }
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  revalidatePath('/cart');
  return { ok: true };
}

/** Remove a line from the cart. */
export async function removeCartItem(input: unknown): Promise<CartActionState> {
  const user = await requireUser();
  const parsed = cartItemRefSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };

  // deleteMany with ownership filter avoids deleting another user's item.
  await prisma.cartItem.deleteMany({
    where: { id: parsed.data.itemId, cart: { userId: user.id } },
  });

  revalidatePath('/cart');
  return { ok: true };
}

/**
 * Merge a guest (localStorage) cart into the user's DB cart after login.
 * Quantities are summed and clamped to stock. Called once on login.
 */
export async function mergeGuestCart(input: unknown): Promise<CartActionState> {
  const user = await requireUser();
  const parsed = guestCartSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };
  if (parsed.data.items.length === 0) return { ok: true };

  const cartId = await getOrCreateCartId(user.id);

  for (const { variantId, quantity } of parsed.data.items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    if (!variant || variant.stock < 1) continue;

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
      select: { quantity: true },
    });
    const merged = Math.min(
      (existing?.quantity ?? 0) + quantity,
      variant.stock,
    );
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      update: { quantity: merged },
      create: { cartId, variantId, quantity: merged },
    });
  }

  revalidatePath('/cart');
  return { ok: true };
}
