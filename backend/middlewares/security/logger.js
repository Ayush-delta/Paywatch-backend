import SecurityLog from "../../models/SecurityLog.js";
import Activity from "../../models/Activity.js";

export default async function logger(ctx, reason) {
  console.log(`[SECURITY BLOCKED] ${ctx.ip} → ${ctx.path} | ${reason}`);

  try {
    await SecurityLog.create({
      ip: ctx.ip,
      userId: ctx.userId || null,
      path: ctx.path,
      method: ctx.method,
      reason,
    });

    await Activity.create({
      type: "security",
      message: `Blocked ${ctx.method} ${ctx.path} from ${ctx.ip} — ${reason}`,
      meta: { ip: ctx.ip, path: ctx.path, method: ctx.method, reason },
    });
  } catch (err) {
    console.error("Security log failed:", err.message);
  }
}
