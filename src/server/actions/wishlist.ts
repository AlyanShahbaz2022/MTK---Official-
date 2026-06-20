'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { variantRefSchema, cartItemRefSchema } from '@/schemas/cart';
import { addToCart } from '@/server/actions/cart';

export type WishlistActionState = { error?: string; ok?: boolean };

async function getOrCreateWishlistId(userId: string): Promise<string> {
  const wl = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
  return wl.id;
}

/** Add a variant to the wishlist (idempotent). */
export async function addToWishlist(
  input: unknown,
): Promise<WishlistActionState> {
  const user = await requireUser();
  const parsed = variantRefSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    select: { id: true },
  });
  if (!variant) return { error: 'Product not found.' };

  const wishlistId = await getOrCreateWishlistId(user.id);
  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_variantId: { wishlistId, variantId: parsed.data.variantId },
    },
    update: {},
    create: { wishlistId, variantId: parsed.data.variantId },
  });

  revalidatePath('/wishlist');
  return { ok: true };
}

/** Remove a wishlist item by its id. */
export async function removeWishlistItem(
  input: unknown,
): Promise<WishlistActionState> {
  const user = await requireUser();
  const parsed = cartItemRefSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };

  await prisma.wishlistItem.deleteMany({
    where: { id: parsed.data.itemId, wishlist: { userId: user.id } },
  });

  revalidatePath('/wishlist');
  return { ok: true };
}

/** Move a wishlist item into the cart (add to cart, then remove from wishlist). */
export async function moveToCart(input: unknown): Promise<WishlistActionState> {
  const user = await requireUser();
  const parsed = cartItemRefSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid request.' };

  const item = await prisma.wishlistItem.findFirst({
    where: { id: parsed.data.itemId, wishlist: { userId: user.id } },
    select: { variantId: true },
  });
  if (!item) return { error: 'Item not found.' };

  const result = await addToCart({ variantId: item.variantId, quantity: 1 });
  if (result.error) return result;

  await prisma.wishlistItem.delete({ where: { id: parsed.data.itemId } });
  revalidatePath('/wishlist');
  revalidatePath('/cart');
  return { ok: true };
}
