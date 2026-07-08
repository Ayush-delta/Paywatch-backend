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
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,

  // Reconnect strategy: retry fast initially (1-3s), then check every 30 seconds forever
  retryStrategy: (times) => {
    if (times <= 3) {
      return times * 1000;
    }
    return 30000; // Check every 30 seconds
  },
});

let isConnected = false;
let loggedErrorOnce = false;

redis.on("ready", () => {
  isConnected = true;
  loggedErrorOnce = false;
  console.log(`✅ Redis connected and ready!`);
});

redis.on("close", () => {
  if (isConnected) {
    console.log(`⚠️ Redis connection lost. Falling back to in-memory mode.`);
    isConnected = false;
  }
});

redis.on("error", (err) => {
  if (!isConnected && !loggedErrorOnce) {
    console.warn(`⚠️ Redis is unreachable (${err.message}). Using in-memory fallback. Will auto-reconnect in the background...`);
    loggedErrorOnce = true;
  } else if (isConnected) {
    console.error("❌ Redis error:", err.message);
  }
});

export default redis;
