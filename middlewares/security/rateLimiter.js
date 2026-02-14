import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "./redisClient.js";

function createLimiter(points, duration, prefix) {
  return new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: prefix,
    points,
    duration,
  });
}

const limiters = {
  auth: createLimiter(10, 60, "rl_auth"),
  users: createLimiter(40, 60, "rl_users"),
  subscriptions: createLimiter(30, 60, "rl_subs"),
  workflows: createLimiter(30, 60, "rl_workflows"),
  general: createLimiter(50, 60, "rl_general"),
};

export default async function rateLimiter(ctx) {
  try {

    const identity = ctx.userId
      ? `user:${ctx.userId}`
      : `ip:${ctx.ip}`;

    let limiter = limiters.general;

    if (ctx.path.startsWith("/api/v1/auth"))
      limiter = limiters.auth;
    else if (ctx.path.startsWith("/api/v1/users"))
      limiter = limiters.users;
    else if (ctx.path.startsWith("/api/v1/subscriptions"))
      limiter = limiters.subscriptions;
    else if (ctx.path.startsWith("/api/v1/workflows"))
      limiter = limiters.workflows;

    await limiter.consume(identity);

    return { allowed: true };
  } catch {
    return {
      allowed: false,
      reason: "Too many requests (rate limit exceeded)",
    };
  }
}
