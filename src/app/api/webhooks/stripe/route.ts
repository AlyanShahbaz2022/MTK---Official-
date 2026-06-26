import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { isStripeConfigured, getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Stripe needs the raw body to verify the signature, so disable any caching.
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      const userId = session.metadata?.userId;

      if (orderNumber) {
        await prisma.order.updateMany({
          where: { orderNumber },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null,
          },
        });
        // Clear the buyer's cart now that payment succeeded.
        if (userId) {
          await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;

      if (orderNumber) {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: { items: true },
        });
        // Only restock/cancel an order that never got paid.
        if (order && order.paymentStatus === 'UNPAID') {
          await prisma.$transaction([
            ...order.items
              .filter((i) => i.variantId)
              .map((i) =>
                prisma.productVariant.update({
                  where: { id: i.variantId! },
                  data: { stock: { increment: i.quantity } },
                }),
              ),
            prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
            }),
          ]);
        }
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
