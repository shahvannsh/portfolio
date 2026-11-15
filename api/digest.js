// Vercel Cron endpoint: sends the ranked summary of every message still waiting. Runs daily (see vercel.json "crons";
// 02:30 UTC = 08:00 in India) and can also be run by hand. Protected by CRON_SECRET: Vercel sends it automatically.
import { timingSafeEqual } from "node:crypto";
import { sendJson } from "./_security.js";
import { sendDigest } from "./_digest.js";
import { redisConfigured } from "./_redis.js";

function authorised(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = String(req.headers?.authorization ?? "");
  const expected = `Bearer ${secret}`;
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { error: "method_not_allowed" });
    }
    if (!process.env.CRON_SECRET) return sendJson(res, 501, { error: "not_configured" });
    if (!authorised(req)) return sendJson(res, 401, { error: "unauthorised" });
    if (!redisConfigured()) return sendJson(res, 501, { error: "not_configured" });
    return sendJson(res, 200, { sent: await sendDigest() });
  } catch {
    return sendJson(res, 500, { error: "server_error" });
  }
}
