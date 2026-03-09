
const headerSafePatterns = {
  sql: /(union|select|drop|insert|delete|update|--|\bor\b|\band\b)/i,
  xss: /(<script|javascript:|onerror=|onload=|<img|<iframe)/i,
  traversal: /\.\.\//,
};

const commandPattern = /(;|\||\&\&|\$\(|`)/;

function containsAttack(value, includeCommand = true) {
  if (!value) return false;
  const str = String(value);
  const hasPattern = Object.values(headerSafePatterns).some((regex) => regex.test(str));
  if (hasPattern) return true;
  if (includeCommand && commandPattern.test(str)) return true;
  return false;
}

function deepScan(obj, includeCommand = true) {
  if (!obj) return false;
  if (typeof obj === "string") return containsAttack(obj, includeCommand);
  if (typeof obj === "object") {
    return Object.values(obj).some((v) => deepScan(v, includeCommand));
  }
  return false;
}

export default async function waf(ctx) {
  try {
    if (deepScan(ctx.query))
      return { allowed: false, reason: "Malicious query detected (WAF)" };

    if (deepScan(ctx.body))
      return { allowed: false, reason: "Malicious payload detected (WAF)" };

    if (deepScan(ctx.headers, false))
      return { allowed: false, reason: "Malicious header detected (WAF)" };

    if (containsAttack(ctx.path))
      return { allowed: false, reason: "Malicious path detected (WAF)" };

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
