
const badAgents = [
  "curl",
  "wget",
  "python",
  "insomnia",
  "bot",
  "crawler",
  "scraper",
  "httpclient",
];

const suspiciousPaths = [
  "/wp-admin",
  "/phpmyadmin",
  "/.env",
  "/.git",
  "/config",
  "/backup",
];

export default async function botDetector(ctx) {
  try {
    const ua = (ctx.headers["user-agent"] || "").toLowerCase();

    if (badAgents.some((b) => ua.includes(b))) {
      return {
        allowed: false,
        reason: "Bot detected (suspicious user-agent)",
      };
    }

    if (suspiciousPaths.some((p) => ctx.path.includes(p))) {
      return {
        allowed: false,
        reason: "Scanner/bot path detected",
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
