import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import redis from "./redisClient.js";

const redisLimiters = {
  auth: new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl_auth", points: 10, duration: 60 }),
  users: new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl_users", points: 40, duration: 60 }),
  subscriptions: new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl_subs", points: 30, duration: 60 }),
  workflows: new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl_workflows", points: 30, duration: 60 }),
  general: new RateLimiterRedis({ storeClient: redis, keyPrefix: "rl_general", points: 50, duration: 60 }),
};

const memoryLimiters = {
  auth: new RateLimiterMemory({ points: 10, duration: 60 }),
  users: new RateLimiterMemory({ points: 40, duration: 60 }),
  subscriptions: new RateLimiterMemory({ points: 30, duration: 60 }),
  workflows: new RateLimiterMemory({ points: 30, duration: 60 }),
  general: new RateLimiterMemory({ points: 50, duration: 60 }),
};

export default async function rateLimiter(ctx) {
  try {
    const identity = ctx.userId
      ? `user:${ctx.userId}`
      : `ip:${ctx.ip}`;

    let limiterKey = "general";

    if (ctx.path.startsWith("/api/v1/auth"))
      limiterKey = "auth";
    else if (ctx.path.startsWith("/api/v1/users"))
      limiterKey = "users";
    else if (ctx.path.startsWith("/api/v1/subscriptions"))
      limiterKey = "subscriptions";
    else if (ctx.path.startsWith("/api/v1/workflows"))
      limiterKey = "workflows";

    const limiter = redis.status === "ready" ? redisLimiters[limiterKey] : memoryLimiters[limiterKey];
    await limiter.consume(identity);

    return { allowed: true };
  } catch (err) {
    if (err instanceof Error) {
      // Unexpected error (e.g. Redis went down after check), fail open
      console.error("Rate Limiter Error:", err.message);
      return { allowed: true };
    }

    // Normal rate limit error results in a specific object or handled rejection
    return {
      allowed: false,
      reason: "Too many requests (rate limit exceeded)",
    };
  }
}
