import waf from "./waf.js";
import rateLimiter from "./rateLimiter.js";
import botDetector from "./botDetector.js";
import validator from "./validator.js";
import logger from "./logger.js";
import { isBanned, recordStrike } from "./ipBan.js";

export default async function securityMiddleware(req, res, next) {
  try {
    const ctx = {
      ip: req.ip,
      userId: req.user?._id || req.user?.id || null,
      path: req.path,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    };

    if (await isBanned(ctx.ip)) {
      return res.status(403).json({
        success: false,
        reason: "IP temporarily banned due to repeated suspicious activity",
      });
    }

    const checks = [
      rateLimiter,
      botDetector,
      waf,
      validator,
    ];

    for (const check of checks) {
      const result = await check(ctx);

      if (!result.allowed) {
        await recordStrike(ctx.ip);

        await logger(ctx, result.reason);

        return res.status(403).json({
          success: false,
          reason: result.reason,
        });
      }
    }

    next();
  } catch (err) {
    next();
  }
}
