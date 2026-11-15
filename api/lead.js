// Vercel serverless function: receives messages from the card page's "Leave your details" form.
//
// What happens to each message:
//   1. Validated and cleaned (see _security.js), bots are dropped quietly.
//   2. The triage agent ranks it (urgent / high / normal / low / spam) and summarises it (_triage.js).
//   3. It is remembered (Upstash Redis, 90 days) so it can be tracked and summarised later.
//   4. Delivery adapts to traffic: urgent/high messages, and messages while it's quiet, are sent at once
//      (email, plus WhatsApp for urgent/high). When it's busy, normal/low messages wait and arrive together as one
//      ranked digest (when enough have piled up, and at the daily cron in api/digest.js). Spam is stored, never sent.
//
// Env: RESEND_API_KEY (email), UPSTASH_REDIS_REST_URL/TOKEN (tracking + digests), ANTHROPIC_API_KEY (AI ranking),
//      CALLMEBOT_APIKEY or WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_ID (WhatsApp), IMMEDIATE_MAX (default 3 per hour),
//      DIGEST_BATCH (default 5), LEAD_TO, LEAD_FROM, ALLOWED_ORIGINS. See .env.example.
import { randomUUID } from "node:crypto";
import { clean, guard, sendJson } from "./_security.js";
import { pipeline, redis, redisConfigured } from "./_redis.js";
import { triage } from "./_triage.js";
import { anyChannelConfigured, notifyLead } from "./_notify.js";
import { sendDigest } from "./_digest.js";

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,255}\.[A-Za-z]{2,}$/;
const HOUR = 60 * 60 * 1000;
const KEEP_SECONDS = 90 * 24 * 60 * 60;
const number = (value, fallback) => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback);

export default async function handler(req, res) {
  try {
    const body = guard(req, res, {
      name: "lead",
      maxBytes: 2500,
      perIp: 4,
      perIpWindowMs: HOUR, // 4 messages per hour per visitor
      globalMax: 60,
      globalWindowMs: HOUR, // 60 per hour in total, so a flood can't fill the inbox
    });
    if (!body) return;

    // Bots: a filled honeypot, a form submitted faster than a human can type, or a link-stuffed message get a fake "ok".
    const message = clean(body.message, 500);
    const tooFast = typeof body.elapsed === "number" && body.elapsed < 1500;
    const linkSpam = (message.match(/https?:\/\//gi) ?? []).length > 2;
    if (clean(body.company, 200) || tooFast || linkSpam) {
      return sendJson(res, 200, { ok: true });
    }

    const name = clean(body.name, 80);
    const email = clean(body.email, 120);
    if (!name || !EMAIL.test(email)) {
      return sendJson(res, 400, { error: "invalid" });
    }

    const storing = redisConfigured();
    if (!storing && !anyChannelConfigured()) {
      return sendJson(res, 501, { error: "not_configured" });
    }

    const lead = { id: randomUUID(), at: Date.now(), name, email, message };
    lead.triage = await triage(lead);
    const spam = lead.triage.priority === "spam";

    // Remember it, and learn how busy the last hour has been.
    let stored = false;
    let busyCount = 0;
    if (storing) {
      try {
        const commands = [
          ["SET", `lead:${lead.id}`, JSON.stringify(lead), "EX", KEEP_SECONDS],
          ["ZADD", "leads:all", lead.at, lead.id],
          ["ZREMRANGEBYSCORE", "leads:all", 0, lead.at - 7 * 24 * HOUR],
          ["ZCOUNT", "leads:all", lead.at - HOUR, "+inf"],
        ];
        if (!spam) commands.push(["RPUSH", "leads:pending", lead.id]);
        busyCount = Number((await pipeline(commands))[3]);
        stored = true;
      } catch {
        stored = false; // a storage outage must never lose a message: fall through to direct email
      }
    }

    if (spam) {
      return sendJson(res, 200, { ok: true }); // kept for your records, never sent
    }

    const quiet = !stored || busyCount <= number(process.env.IMMEDIATE_MAX, 3);
    const important = ["urgent", "high"].includes(lead.triage.priority);
    let delivered = false;

    if (quiet || important) {
      delivered = await notifyLead(lead);
      if (delivered && stored) await redis("LREM", "leads:pending", 0, lead.id).catch(() => undefined);
    } else {
      // Busy: wait for a digest. Send it now if enough have piled up.
      const waiting = Number(await redis("LLEN", "leads:pending").catch(() => 0));
      if (waiting >= number(process.env.DIGEST_BATCH, 5)) delivered = (await sendDigest().catch(() => 0)) > 0;
    }

    if (delivered || stored) {
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 502, { error: "send_failed" });
  } catch {
    return sendJson(res, 500, { error: "server_error" }); // never leak details
  }
}
