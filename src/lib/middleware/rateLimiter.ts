/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse using Upstash Redis
 * 
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * AI Content Generation Rate Limiter
 * 
 * Limit: 10 requests per minute per user
 * Use for: All AI content generation endpoints (summary, bullets, etc.)
 * 
 * Why 10/min: Balances user experience with cost protection
 * - Allows legitimate rapid edits
 * - Prevents API abuse and cost overruns
 * - Google Gemini charges per token, so this is critical
 */
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai",
});

/**
 * Heavy Operation Rate Limiter
 * 
 * Limit: 5 requests per minute per user
 * Use for: CPU/memory intensive operations (PDF generation, large file processing)
 * 
 * Why 5/min: These operations are expensive computationally
 * - PDF export with complex templates
 * - Large resume parsing
 * - Bulk operations
 */
export const heavyRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:heavy",
});

/**
 * General API Rate Limiter
 * 
 * Limit: 100 requests per minute per user
 * Use for: Standard CRUD operations (resume updates, profile changes)
 * 
 * Why 100/min: Allows smooth UI interactions
 * - Auto-save functionality
 * - Real-time updates
 * - Normal user behavior
 */
export const generalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
});

/**
 * Authentication Rate Limiter
 * 
 * Limit: 5 requests per 15 minutes per IP
 * Use for: Login, signup, password reset
 * 
 * Why 5/15min: Prevents brute force attacks
 * - Protects against credential stuffing
 * - Allows legitimate retry attempts
 * - Uses IP-based limiting (not user-based)
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

/**
 * Rate Limit Response Headers
 * 
 * Standard headers to inform clients about rate limits
 * @see https://tools.ietf.org/id/draft-polli-ratelimit-headers-00.html
 */
export type RateLimitHeaders = {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
  "Retry-After"?: string;
  [key: string]: string | undefined;
}

/**
 * Create standardized rate limit headers
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number,
  includeRetryAfter: boolean = false
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (includeRetryAfter) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    headers["Retry-After"] = retryAfterSeconds.toString();
  }

  return headers;
}

/**
 * Create a user-friendly rate limit error response
 */
export function createRateLimitError(reset: number) {
  const resetDate = new Date(reset);
  const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);
  const minutesUntilReset = Math.ceil(secondsUntilReset / 60);

  return {
    error: "Rate limit exceeded",
    message: `Too many requests. Please try again in ${
      minutesUntilReset === 1
        ? "1 minute"
        : secondsUntilReset < 60
        ? `${secondsUntilReset} seconds`
        : `${minutesUntilReset} minutes`
    }.`,
    code: "RATE_LIMIT_EXCEEDED",
    statusCode: 429,
    remaining: 0,
    resetAt: resetDate.toISOString(),
    resetIn: secondsUntilReset,
    tip: "Consider upgrading to Premium for higher rate limits.",
  };
}

/**
 * Helper function to check rate limit and return formatted response
 * 
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (usually userId)
 * @returns Object with success status and headers
 * 
 * @example
 * ```typescript
 * const result = await checkRateLimit(aiRateLimiter, userId);
 * if (!result.success) {
 *   return NextResponse.json(result.error, { 
 *     status: 429, 
 *     headers: result.headers 
 *   });
 * }
 * ```
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  limitAmount: number = 10
) {
  const { success, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return {
      success: false as const,
      error: createRateLimitError(reset),
      headers: createRateLimitHeaders(limitAmount, 0, reset, true),
      remaining: 0,
      reset,
    };
  }

  return {
    success: true as const,
    headers: createRateLimitHeaders(limitAmount, remaining, reset),
    remaining,
    reset,
  };
}

/**
 * Rate limit configuration by endpoint type
 */
export const RATE_LIMITS = {
  AI_GENERATION: { limit: 10, window: "1 minute" },
  HEAVY_OPERATION: { limit: 5, window: "1 minute" },
  GENERAL_API: { limit: 100, window: "1 minute" },
  AUTHENTICATION: { limit: 5, window: "15 minutes" },
} as const;
