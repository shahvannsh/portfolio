// Shared protections for the serverless functions. (Files starting with "_" are not exposed as endpoints.)

const SITE = "https://portfolio-mu-ruby-37.vercel.app";

/** Origins allowed to call the API from a browser. Add more with the ALLOWED_ORIGINS env var (comma-separated). */
export function allowedOrigins() {
  const origins = new Set([SITE]);
  for (const o of (process.env.ALLOWED_ORIGINS ?? "").split(",")) if (o.trim()) origins.add(o.trim());
  // Vercel preview deployments call their own URL.
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (host) origins.add(`https://${host}`);
  return origins;
}

export function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
}

export function sendJson(res, status, body) {
  setSecurityHeaders(res);
  return res.status(status).json(body);
}

/** Strips control, zero-width and bidi-override characters (used for spoofing / header injection), then trims and caps length. */
export function clean(value, max) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function clientIp(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] ?? "").split(",")[0].trim();
  return forwarded.slice(0, 64) || "unknown";
}

// ---- rate limiting (per serverless instance: a safety net, not a substitute for a Vercel Firewall rate-limit rule) ----
const buckets = new Map(); // key -> timestamps
const MAX_KEYS = 5000;

/** Returns true when `key` has made more than `max` calls within `windowMs`. */
export function rateLimited(key, max, windowMs) {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    for (const [k, stamps] of buckets) if (!stamps.some((t) => now - t < windowMs)) buckets.delete(k);
    if (buckets.size > MAX_KEYS) buckets.clear(); // bounded memory even under attack
  }
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > max;
}

/**
 * Validates an incoming browser request. Returns the parsed JSON body, or null after sending an error response.
 * Checks: POST only, JSON content type, small body, same-site origin, per-IP and global rate limits.
 */
export function guard(req, res, { name, maxBytes = 4096, perIp, perIpWindowMs, globalMax, globalWindowMs }) {
  if (req.method !== "POST") {
    setSecurityHeaders(res);
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "method_not_allowed" });
    return null;
  }

  const origin = req.headers?.origin;
  const site = req.headers?.["sec-fetch-site"];
  if ((origin && !allowedOrigins().has(origin)) || (site && !["same-origin", "same-site", "none"].includes(site))) {
    sendJson(res, 403, { error: "forbidden" });
    return null;
  }

  if (!String(req.headers?.["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
    sendJson(res, 415, { error: "unsupported_media_type" });
    return null;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    sendJson(res, 400, { error: "invalid" });
    return null;
  }
  if (JSON.stringify(body).length > maxBytes) {
    sendJson(res, 413, { error: "too_large" });
    return null;
  }

  if (rateLimited(`${name}:ip:${clientIp(req)}`, perIp, perIpWindowMs) || rateLimited(`${name}:all`, globalMax, globalWindowMs)) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, { error: "rate_limited" });
    return null;
  }
  return body;
}
