// Sends one ranked summary of every message that is still waiting (not yet emailed individually).
import { redis, redisConfigured } from "./_redis.js";
import { overview, rank } from "./_triage.js";
import { digestEmailText, digestSubject, digestWhatsApp, sendEmail, sendWhatsApp, whatsappConfigured } from "./_notify.js";

const MAX_PER_DIGEST = 100;

/** Returns the number of messages summarised (0 when nothing was waiting or nothing could be delivered). */
export async function sendDigest() {
  if (!redisConfigured()) return 0;
  const ids = await redis("LRANGE", "leads:pending", 0, MAX_PER_DIGEST - 1);
  if (!ids.length) return 0;

  const rows = await redis("MGET", ...ids.map((id) => `lead:${id}`));
  const leads = rows.filter(Boolean).map((row) => JSON.parse(row));
  if (!leads.length) {
    await redis("LTRIM", "leads:pending", ids.length, -1); // nothing left to send (expired), clear the queue
    return 0;
  }

  const ranked = rank(leads);
  const briefing = await overview(ranked);
  const emailed = await sendEmail({ subject: digestSubject(ranked), text: digestEmailText(ranked, briefing) });
  const alerted = whatsappConfigured() ? await sendWhatsApp(digestWhatsApp(ranked, briefing)) : false;
  if (!emailed && !alerted) return 0; // keep them queued and try again next time

  await redis("LTRIM", "leads:pending", ids.length, -1);
  return leads.length;
}
