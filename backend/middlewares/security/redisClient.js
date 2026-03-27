import Redis from "ioredis";

const isUpstash = process.env.REDIS_HOST?.includes("upstash");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,

  // TLS is required for Upstash cloud Redis
  tls: isUpstash ? {} : undefined,

  // Upstash doesn't support the Redis READY CHECK command
  enableReadyCheck: false,

  // Avoid hanging requests if Redis is briefly unreachable
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,

  // Reconnect strategy: exponential backoff capped at 3s
  retryStrategy: (times) => Math.min(times * 200, 3000),
});

redis.on("connect", () =>
  console.log(`✅ Redis connected to ${isUpstash ? "Upstash" : "localhost"}`)
);
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

export default redis;
