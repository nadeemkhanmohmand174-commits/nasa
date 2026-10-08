import { isRateLimitConfigured, getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Rate limiter using Upstash Redis. Degrades gracefully to a no-op
 * when Redis is not configured.
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/** No-op rate limiter — always succeeds */
function noopRateLimit(): Promise<RateLimitResult> {
  return Promise.resolve({ success: true, limit: 30, remaining: 29, reset: 60 });
}

/** Get client IP from request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0] ?? 'unknown';
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

/**
 * Check rate limit for a given identifier and limit config.
 * Returns whether the request is allowed and rate limit headers.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 30,
  window: string = '60 s'
): Promise<RateLimitResult> {
  if (!isRateLimitConfigured()) {
    return noopRateLimit();
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const env = getEnv();

    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window as import('@upstash/ratelimit').Duration),
      analytics: true,
    });

    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err) {
    logger.warn('Rate limit check failed, allowing request', { error: (err as Error).message });
    return noopRateLimit();
  }
}

/** Apply rate limit headers to a response */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}
