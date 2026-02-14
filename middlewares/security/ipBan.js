import redis from "./redisClient.js";

const STRIKE_LIMIT = 5;
const BAN_DURATION = 900;

export async function isBanned(ip) {
  if (ip === "::1" || ip === "127.0.0.1") return false;
  const banned = await redis.get(`ban:${ip}`);
  return !!banned;
}

export async function recordStrike(ip) {
  const strikes = await redis.incr(`strike:${ip}`);

  if (strikes === 1) {
    await redis.expire(`strike:${ip}`, 600);
  }

  if (strikes >= STRIKE_LIMIT) {
    await redis.set(`ban:${ip}`, 1, "EX", BAN_DURATION);
    await redis.del(`strike:${ip}`);
  }
}
