import { headers } from 'next/headers';

/** Extract client IP + user-agent from request headers (for audit/rate-limit). */
export async function getRequestInfo() {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  const userAgent = h.get('user-agent') ?? 'unknown';
  return { ip, userAgent };
}
