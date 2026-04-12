import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// ─────────────────────────────────────────
// REDIS CLIENT
// ─────────────────────────────────────────

export const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ─────────────────────────────────────────
// RATE LIMITER
// Sliding window: 10 requests / 10 seconds per IP
// 1M DAU ke liye baseline — middleware mein use hoga
// ─────────────────────────────────────────

export const rateLimiter = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix:    "tcb:ratelimit",
})

// ─────────────────────────────────────────
// CACHE HELPERS
// ─────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data ?? null
  } catch {
    return null
  }
}

export async function setCache<T>(
  key:     string,
  value:   T,
  ttlSecs: number = 900   // default: 15 min (ISR ke saath match)
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSecs })
  } catch {
    // Cache fail hone par app crash nahi karni chahiye
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {
    // Silent fail
  }
}

// ─────────────────────────────────────────
// CACHE KEY HELPERS — consistent naming
// ─────────────────────────────────────────

export const CacheKeys = {
  post:          (slug: string)   => `tcb:post:${slug}`,
  posts:         (page: number)   => `tcb:posts:page:${page}`,
  postsByTag:    (tag: string)    => `tcb:posts:tag:${tag}`,
  trendingPosts: ()               => `tcb:posts:trending`,
} as const