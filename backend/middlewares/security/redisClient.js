import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  // Enable TLS if connecting to Upstash or other cloud providers requiring it
  tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes("upstash") ? {} : undefined,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
