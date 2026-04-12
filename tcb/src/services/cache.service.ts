"use server"

import { redis, CacheKeys } from "@/lib/redis"

// ─────────────────────────────────────────
// INVALIDATE POST CACHES
// Post update hone par call karo
// ─────────────────────────────────────────

export async function invalidatePostCaches(slug: string): Promise<void> {
  try {
    await Promise.all([
      redis.del(CacheKeys.post(slug)),
      redis.del(CacheKeys.posts(1)),
      redis.del(CacheKeys.posts(2)),
      redis.del(CacheKeys.trendingPosts()),
    ])
  } catch {
    // Silent fail
  }
}

// ─────────────────────────────────────────
// INVALIDATE ALL POSTS CACHE
// Major update hone par — e.g. bulk publish
// ─────────────────────────────────────────

export async function invalidateAllPostCaches(): Promise<void> {
  try {
    const keys = await redis.keys("tcb:posts:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Silent fail
  }
}