'use server';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { getCart } from '@/server/cart';
import { checkoutSchema, couponPreviewSchema } from '@/schemas/checkout';
import { computeShipping, type DeliveryMethodId } from '@/lib/checkout-pricing';
import { generateOrderNumber, validateCoupon } from '@/server/orders';
import { isStripeConfigured, getStripe } from '@/lib/stripe';
import { isCloudinaryConfigured, uploadImage } from '@/lib/cloudinary';

const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type PlaceOrderState = {
  error?: string;
  orderNumber?: string;
  redirectUrl?: string;
};

class StockError extends Error {}
class CouponError extends Error {}

/** Live coupon preview against the user's current cart subtotal. */
export async function previewCoupon(code: string): Promise<{
  ok: boolean;
  error?: string;
  discount?: number;
  code?: string;
}> {
  const user = await requireUser();
  const parsed = couponPreviewSchema.safeParse({ code });
  if (!parsed.success) return { ok: false, error: 'Enter a coupon code.' };

  const cart = await getCart(user.id);
  if (cart.lines.length === 0) {
    return { ok: false, error: 'Your cart is empty.' };
  }

  const result = await validateCoupon(parsed.data.code, cart.subtotal);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, discount: result.discount, code: result.coupon!.code };
}

/**
 * Place an order. Server-authoritative: every total is recomputed from the DB,
 * stock is decremented atomically, and the order is created in a transaction.
 * COD clears the cart immediately; CARD hands off to Stripe Checkout.
 */
export async function placeOrder(
  _prev: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const user = await requireUser();

  const parsed = checkoutSchema.safeParse({
    email: formData.get('email'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    line1: formData.get('line1'),
    line2: formData.get('line2'),
    city: formData.get('city'),
    state: formData.get('state'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country') || 'PK',
    deliveryMethod: formData.get('deliveryMethod') || 'standard',
    paymentMethod: formData.get('paymentMethod') || 'COD',
    couponCode: formData.get('couponCode'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please check your details.' };
  }
  const data = parsed.data;

  // Recompute the cart server-side — never trust client totals.
  const cart = await getCart(user.id);
  if (cart.lines.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  const subtotal = cart.subtotal;
  const shipping = computeShipping(
    data.deliveryMethod as DeliveryMethodId,
    subtotal,
  );

  // Validate coupon (if any) against the authoritative subtotal.
  let discount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (data.couponCode) {
    const res = await validateCoupon(data.couponCode, subtotal);
    if (!res.ok) return { error: res.error };
    discount = res.discount ?? 0;
    couponCode = res.coupon!.code;
    couponId = res.coupon!.id;
  }

  const total = Math.max(0, subtotal + shipping - discount);

  if (data.paymentMethod === 'CARD' && !isStripeConfigured) {
    return {
      error: 'Card payments are unavailable right now. Please choose Cash on Delivery.',
    };
  }

  // ---- EasyPaisa: validate + upload the payment screenshot up front. ----
  let proofUrl: string | null = null;
  let proofId: string | null = null;
  if (data.paymentMethod === 'EASYPAISA') {
    if (!isCloudinaryConfigured) {
      return {
        error: 'EasyPaisa payments are unavailable right now. Please choose Cash on Delivery.',
      };
    }
    const file = formData.get('paymentProof');
    if (!(file instanceof File) || file.size === 0) {
      return { error: 'Please upload a screenshot of your EasyPaisa transfer.' };
    }
    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      return { error: 'Screenshot must be a JPG, PNG, or WEBP image.' };
    }
    if (file.size > MAX_PROOF_BYTES) {
      return { error: 'Screenshot is too large (max 5 MB).' };
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadImage(buffer, 'payment-proofs');
      proofUrl = uploaded.url;
      proofId = uploaded.publicId;
    } catch (err) {
      console.error('Payment proof upload failed:', err);
      return { error: 'We could not upload your screenshot. Please try again.' };
    }
  }

  const orderNumber = await generateOrderNumber();

  // Atomically: decrement stock, increment coupon usage, create the order.
  let orderId: string;
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const line of cart.lines) {
        const updated = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          throw new StockError(`"${line.name}" is out of stock.`);
        }
      }

      if (couponId) {
        const bumped = await tx.coupon.updateMany({
          where: {
            id: couponId,
            isActive: true,
            OR: [
              { maxRedemptions: null },
              { maxRedemptions: { gt: prisma.coupon.fields.timesRedeemed } },
            ],
          },
          data: { timesRedeemed: { increment: 1 } },
        });
        if (bumped.count !== 1) {
          throw new CouponError('This coupon is no longer available.');
        }
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          paymentMethod: data.paymentMethod,
          subtotal,
          shipping,
          discount,
          total,
          couponCode,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state || null,
          postalCode: data.postalCode || null,
          country: data.country || 'PK',
          paymentProofUrl: proofUrl,
          paymentProofId: proofId,
          items: {
            create: cart.lines.map((line) => ({
              variantId: line.variantId,
              productName: line.name,
              productSlug: line.slug,
              variantLabel: `${line.size} · ${line.color}`,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              lineTotal: line.lineTotal,
              image: line.image?.url ?? null,
            })),
          },
        },
        select: { id: true },
      });
    });
    orderId = order.id;
  } catch (err) {
    if (err instanceof StockError) return { error: err.message };
    if (err instanceof CouponError) return { error: err.message };
    console.error('placeOrder failed:', err);
    return { error: 'Something went wrong placing your order. Please try again.' };
  }

  // ---- Cash on Delivery: confirm immediately, clear the cart. ----
  if (data.paymentMethod === 'COD') {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } }),
    ]);
    return { orderNumber };
  }

  // ---- EasyPaisa: order stays PENDING/UNPAID awaiting admin verification. ----
  if (data.paymentMethod === 'EASYPAISA') {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
    return { orderNumber };
  }

  // ---- Card: hand off to Stripe Checkout. ----
  try {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'pkr',
            unit_amount: total,
            product_data: { name: `MTK Order ${orderNumber}` },
          },
        },
      ],
      metadata: { orderNumber, userId: user.id },
      success_url: `${appUrl}/checkout/success?order=${orderNumber}`,
      cancel_url: `${appUrl}/checkout?canceled=1`,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return { redirectUrl: session.url ?? undefined };
  } catch (err) {
    console.error('Stripe session failed:', err);
    return {
      error: 'We could not start the card payment. Please try Cash on Delivery.',
    };
  }
}
