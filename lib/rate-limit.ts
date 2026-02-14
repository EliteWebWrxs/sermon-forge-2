/**
 * Simple in-memory rate limiting
 *
 * NOTE: This is a basic implementation for development/low-traffic scenarios.
 * For production at scale, use:
 * - Upstash Rate Limit: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 * - Redis-based rate limiting
 * - Edge middleware rate limiting (Vercel, Cloudflare)
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // Default: 10 requests per hour
): RateLimitResult {
  const now = Date.now()
  const record = store[identifier]

  // Clean up expired records
  if (record && record.resetAt < now) {
    delete store[identifier]
  }

  // Check if limit exceeded
  if (record && record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  // Increment counter
  if (record) {
    record.count++
  } else {
    store[identifier] = {
      count: 1,
      resetAt: now + config.windowMs,
    }
  }

  const current = store[identifier]

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - current.count,
    resetAt: current.resetAt,
  }
}

/**
 * Middleware helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Limit", result.limit.toString())
  headers.set("X-RateLimit-Remaining", result.remaining.toString())
  headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString())
}

/**
 * Clean up expired records periodically (call this in a cron job or background task)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  })
}

// Example usage in API route:
/*
import { rateLimit, addRateLimitHeaders } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)

  const rateLimitResult = rateLimit(userId, {
    maxRequests: 5,    // 5 generations
    windowMs: 3600000  // per hour
  })

  if (!rateLimitResult.success) {
    const headers = new Headers()
    addRateLimitHeaders(headers, rateLimitResult)

    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        resetAt: rateLimitResult.resetAt
      },
      { status: 429, headers }
    )
  }

  // Process request...
}
*/
