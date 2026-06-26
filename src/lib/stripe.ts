import 'server-only';
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

/** True when Stripe keys are present — card checkout is gated on this. */
export const isStripeConfigured = Boolean(secretKey);

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!secretKey) {
    throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY).');
  }
  if (!_stripe) {
    _stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' });
  }
  return _stripe;
}
