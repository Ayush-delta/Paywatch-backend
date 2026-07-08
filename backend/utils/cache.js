import redis from "../middlewares/security/redisClient.js";

/**
 * cacheOrFetch
 * Reads a JSON value from Redis; on miss, runs `fetcher`, caches the result
 * with the given TTL, and returns it. Fails open: if Redis is unavailable or
 * errors, falls straight through to `fetcher` so an outage never breaks an
 * endpoint — it just loses caching until Redis recovers.
 *
 * @param {string} key - cache key, e.g. "admin:users:stats"
 * @param {number} ttlSeconds - how long to cache the result
 * @param {() => Promise<any>} fetcher - produces the value on a cache miss
 */
export async function cacheOrFetch(key, ttlSeconds, fetcher) {
    try {
        if (redis.status === "ready") {
            const cached = await redis.get(key);
            if (cached) return JSON.parse(cached);
        }
    } catch (err) {
        console.error(`Cache read failed for ${key}:`, err.message);
    }

    const fresh = await fetcher();

    try {
        if (redis.status === "ready") {
            await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
        }
    } catch (err) {
        console.error(`Cache write failed for ${key}:`, err.message);
    }

    return fresh;
}

/**
 * invalidate
 * Deletes one or more cache keys, e.g. after a write that makes cached
 * aggregates stale. Safe to call even if Redis is down.
 */
export async function invalidate(...keys) {
    try {
        if (redis.status === "ready" && keys.length) {
            await redis.del(...keys);
        }
    } catch (err) {
        console.error(`Cache invalidate failed for ${keys.join(", ")}:`, err.message);
    }
}
