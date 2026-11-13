// Vercel serverless function: emails Vannsh when someone leaves their details on the card page.
// Needs the RESEND_API_KEY environment variable (https://resend.com). Optional: LEAD_TO, LEAD_FROM, ALLOWED_ORIGINS.
// Without a key it answers 501 and the page falls back to a mailto/WhatsApp link.
import { clean, guard, sendJson } from "./_security.js";

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,255}\.[A-Za-z]{2,}$/;

export default async function handler(req, res) {
  try {
    const body = guard(req, res, {
      name: "lead",
      maxBytes: 2500,
      perIp: 4,
      perIpWindowMs: 60 * 60 * 1000, // 4 messages per hour per visitor
      globalMax: 60,
      globalWindowMs: 60 * 60 * 1000, // 60 per hour in total, so a flood can't fill the inbox
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

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return sendJson(res, 501, { error: "not_configured" });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_FROM || "Portfolio <onboarding@resend.dev>",
        to: [process.env.LEAD_TO || "shahvannsh@gmail.com"],
        reply_to: email,
        subject: `New contact from your portfolio: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message || "(no message)"}\n\nSent from the /card page. Treat links and attachments from strangers with care.`,
      }),
    });
    return sendJson(res, response.ok ? 200 : 502, response.ok ? { ok: true } : { error: "send_failed" });
  } catch {
    return sendJson(res, 500, { error: "server_error" }); // never leak details
  }
}
