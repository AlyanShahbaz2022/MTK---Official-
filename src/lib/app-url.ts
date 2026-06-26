/**
 * Resolve the canonical base URL of the app at runtime.
 *
 * Order of precedence:
 *  1. NEXT_PUBLIC_APP_URL  — explicit, set this in production.
 *  2. AUTH_URL             — Auth.js base URL (often already set).
 *  3. VERCEL_URL           — auto-injected by Vercel for every deployment
 *                            (no protocol, so we prepend https://).
 *  4. http://localhost:3000 — dev fallback only.
 *
 * This prevents redirect/Stripe/email links from accidentally pointing at
 * localhost when the deploy host's env vars are incomplete.
 */
export function getAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return 'http://localhost:3000';
}
