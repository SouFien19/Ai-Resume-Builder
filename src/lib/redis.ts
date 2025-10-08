import { Redis } from '@upstash/redis';

/**
 * Redis Client with Graceful Fallback
 * 
 * This module provides a Redis caching layer that gracefully falls back
 * to normal operation if Redis is unavailable or disabled.
 * 
 * Features:
 * - Singleton pattern (one Redis instance)
 * - Automatic fallback if Redis unavailable
 * - Can be disabled via environment variable
 * - Never throws errors (fails gracefully)
 * - Logs errors for debugging
 * 
 * Usage:
 * ```typescript
 * import { getCache, setCache, deleteCache } from '@/lib/redis';
 * 
 * // Try to get from cache
 * const cached = await getCache('my-key');
 * if (cached) return cached;
 * 
 * // Fetch from database
 * const data = await fetchFromDatabase();
 * 
 * // Store in cache (best effort)
 * await setCache('my-key', data, 300); // 5 minutes
 * ```
 */

// Singleton Redis instance
let redis: Redis | null = null;
let isRedisAvailable = true;

/**
 * Get or create Redis client
 * Returns null if Redis is disabled or unavailable
 */
export function getRedis(): Redis | null {
  // Check if Redis is disabled via environment
  if (process.env.REDIS_ENABLED === 'false') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Redis] Disabled via REDIS_ENABLED=false');
    }
    return null;
  }

  // Check if Redis credentials are available
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Redis] Not configured - missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
    }
    return null;
  }

  // Return existing instance if available
  if (redis && isRedisAvailable) {
    return redis;
  }

  // Create new Redis instance
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Redis] Connected successfully');
    }

    return redis;
  } catch (error) {
    console.error('[Redis] Failed to initialize:', error);
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Get value from cache
 * Returns null if not found or Redis unavailable
 * Never throws errors
 * 
 * @param key Cache key
 * @returns Cached value or null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;

    const data = await client.get(key);
    
    if (data && process.env.NODE_ENV === 'development') {
      console.log(`[Redis] ✅ Cache HIT: ${key}`);
    }

    return data as T;
  } catch (error) {
    console.error(`[Redis] Error getting cache for key "${key}":`, error);
    // Mark Redis as unavailable temporarily
    isRedisAvailable = false;
    // Reset availability after 30 seconds
    setTimeout(() => {
      isRedisAvailable = true;
    }, 30000);
    return null;
  }
}

/**
 * Set value in cache
 * Fails silently if Redis unavailable
 * Never throws errors
 * 
 * @param key Cache key
 * @param value Value to cache (will be JSON serialized)
 * @param expirySeconds Cache TTL in seconds (default: 300 = 5 minutes)
 */
export async function setCache(
  key: string,
  value: any,
  expirySeconds = 300
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    await client.set(key, value, { ex: expirySeconds });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Redis] ✅ Cache SET: ${key} (TTL: ${expirySeconds}s)`);
    }
  } catch (error) {
    console.error(`[Redis] Error setting cache for key "${key}":`, error);
    isRedisAvailable = false;
    setTimeout(() => {
      isRedisAvailable = true;
    }, 30000);
  }
}

/**
 * Delete value from cache
 * Fails silently if Redis unavailable
 * Never throws errors
 * 
 * @param key Cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    await client.del(key);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Redis] ✅ Cache DELETE: ${key}`);
    }
  } catch (error) {
    console.error(`[Redis] Error deleting cache for key "${key}":`, error);
    isRedisAvailable = false;
    setTimeout(() => {
      isRedisAvailable = true;
    }, 30000);
  }
}

/**
 * Delete multiple cache keys
 * Useful for cache invalidation patterns
 * 
 * @param keys Array of cache keys to delete
 */
export async function deleteCacheMultiple(keys: string[]): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    if (keys.length === 0) return;

    await client.del(...keys);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Redis] ✅ Cache DELETE multiple: ${keys.join(', ')}`);
    }
  } catch (error) {
    console.error('[Redis] Error deleting multiple cache keys:', error);
    isRedisAvailable = false;
    setTimeout(() => {
      isRedisAvailable = true;
    }, 30000);
  }
}

/**
 * Check if cache key exists
 * Returns false if Redis unavailable
 * 
 * @param key Cache key to check
 * @returns true if key exists, false otherwise
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const client = getRedis();
    if (!client) return false;

    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`[Redis] Error checking cache for key "${key}":`, error);
    return false;
  }
}

/**
 * Get remaining TTL for a cache key
 * Returns -1 if key doesn't exist or Redis unavailable
 * 
 * @param key Cache key
 * @returns TTL in seconds, or -1 if key doesn't exist
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const client = getRedis();
    if (!client) return -1;

    const ttl = await client.ttl(key);
    return ttl;
  } catch (error) {
    console.error(`[Redis] Error getting TTL for key "${key}":`, error);
    return -1;
  }
}

/**
 * Clear all cache keys (use with caution!)
 * Only works in development environment
 */
export async function clearAllCache(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[Redis] clearAllCache() is only available in development');
    return;
  }

  try {
    const client = getRedis();
    if (!client) return;

    await client.flushdb();

    console.log('[Redis] ✅ All cache cleared');
  } catch (error) {
    console.error('[Redis] Error clearing all cache:', error);
  }
}

/**
 * Test Redis connection
 * Returns true if Redis is available, false otherwise
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedis();
    if (!client) return false;

    // Try to ping Redis
    await client.set('__test__', 'ping', { ex: 10 });
    const result = await client.get('__test__');
    await client.del('__test__');

    return result === 'ping';
  } catch (error) {
    console.error('[Redis] Connection test failed:', error);
    return false;
  }
}

// Export cache key builders for consistency
export const CacheKeys = {
  templates: {
    all: () => 'templates:all',
    byId: (id: string) => `templates:${id}`,
  },
  stats: {
    user: (userId: string) => `stats:${userId}`,
  },
  resumes: {
    user: (userId: string) => `resumes:${userId}`,
    byId: (id: string) => `resume:${id}`,
  },
  ai: {
    response: (hash: string) => `ai:${hash}`,
  },
} as const;
