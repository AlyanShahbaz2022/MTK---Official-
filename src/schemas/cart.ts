import { z } from 'zod';

export const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

export const updateQtySchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(20),
});

export const cartItemRefSchema = z.object({
  itemId: z.string().min(1),
});

export const variantRefSchema = z.object({
  variantId: z.string().min(1),
});

// Guest cart payload sent at login-time for merging into the DB cart.
export const guestCartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .max(100),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
