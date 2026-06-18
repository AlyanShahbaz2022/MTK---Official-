/**
 * Lightweight fixed-window rate limiter (spec project.md §6.7, §6.8).
 *
 * Default backing store is in-memory — fine for a single instance / dev.
 * For multi-instance production, swap `MemoryStore` for a Redis/Upstash-backed
 * store implementing the same interface; call sites do not change.
 */

interface RateLimitStore {
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowMs: number) {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const bucket = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
      return bucket;
    }
    existing.count += 1;
    return existing;
  }
}

const store: RateLimitStore = new MemoryStore();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key      Unique identifier (e.g. `login:<ip>` or `login:<email>`).
 * @param limit    Max attempts per window.
 * @param windowMs Window length in ms.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const { count, resetAt } = await store.hit(key, windowMs);
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}
