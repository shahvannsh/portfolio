// Delivers messages to Vannsh: email (Resend) and, optionally, a WhatsApp alert.
// Email:    RESEND_API_KEY, optional LEAD_TO, LEAD_FROM.
// WhatsApp: either CALLMEBOT_APIKEY (free personal alerts, https://www.callmebot.com/blog/free-api-whatsapp-messages/)
//           or WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_ID (Meta WhatsApp Cloud API). Number: LEAD_WHATSAPP_TO (default below).

const OWNER_EMAIL = "shahvannsh@gmail.com";
const OWNER_WHATSAPP = "918668995892";

export const LABEL = { urgent: "🔴 Urgent", high: "🟠 High", normal: "🟢 Normal", low: "⚪ Low", spam: "🗑 Spam" };

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);
export const whatsappConfigured = () => Boolean(process.env.CALLMEBOT_APIKEY || (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_ID));
export const anyChannelConfigured = () => emailConfigured() || whatsappConfigured();

const short = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export async function sendEmail({ subject, text, replyTo }) {
  if (!emailConfigured()) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_FROM || "Portfolio <onboarding@resend.dev>",
        to: [process.env.LEAD_TO || OWNER_EMAIL],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendWhatsApp(text) {
  const to = (process.env.LEAD_WHATSAPP_TO || OWNER_WHATSAPP).replace(/\D/g, "");
  const body = short(text, 900);
  try {
    if (process.env.CALLMEBOT_APIKEY) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${to}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
      return (await fetch(url, { signal: AbortSignal.timeout(10000) })).ok;
    }
    if (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      const response = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(process.env.WHATSAPP_PHONE_ID)}/messages`, {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
      });
      return response.ok;
    }
  } catch {
    // fall through
  }
  return false;
}

// ---- one message ----
export const leadSubject = (lead) => `${LABEL[lead.triage.priority]} · ${lead.name} (${lead.triage.category}) — new portfolio message`;

export function leadEmailText(lead) {
  const t = lead.triage;
  return [
    `${LABEL[t.priority]} — score ${t.score}/100 — ${t.category} (ranked by ${t.by === "ai" ? "the AI assistant" : "simple rules"})`,
    t.suspicious ? "⚠ This message tries to give instructions to the assistant, so it was capped at Normal. Treat it with care." : "",
    "",
    `Summary: ${t.summary}`,
    t.reply ? `\nSuggested reply:\n${t.reply}` : "",
    "",
    "--- Original message ---",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Received: ${new Date(lead.at).toISOString()}`,
    "",
    lead.message || "(no message)",
    "",
    "Reply to this email to answer them directly. Treat links and attachments from strangers with care.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export const leadWhatsApp = (lead) =>
  `${LABEL[lead.triage.priority]} message from ${lead.name} (${lead.triage.category}, ${lead.triage.score}/100)\n${short(lead.triage.summary, 300)}\nReply: ${lead.email}`;

/** Sends one message to every configured channel. Email must succeed for it to count; WhatsApp is only for urgent/high. */
export async function notifyLead(lead) {
  const sent = await sendEmail({ subject: leadSubject(lead), text: leadEmailText(lead), replyTo: lead.email });
  const alert = ["urgent", "high"].includes(lead.triage.priority) && whatsappConfigured() ? await sendWhatsApp(leadWhatsApp(lead)) : false;
  return sent || alert;
}

// ---- a ranked digest ----
export function digestSubject(leads) {
  const urgent = leads.filter((l) => l.triage.priority === "urgent").length;
  const high = leads.filter((l) => l.triage.priority === "high").length;
  return `📬 ${leads.length} new portfolio message${leads.length === 1 ? "" : "s"}${urgent ? ` · ${urgent} urgent` : ""}${high ? ` · ${high} high` : ""}`;
}

export function digestEmailText(ranked, briefing) {
  const items = ranked.map((lead, i) => {
    const t = lead.triage;
    return [
      `${i + 1}. ${LABEL[t.priority]} — ${lead.name} <${lead.email}> — ${t.category}, ${t.score}/100${t.suspicious ? " ⚠ suspicious" : ""}`,
      `   ${t.summary}`,
      t.reply ? `   Suggested reply: ${t.reply}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [briefing, "", "Ranked by priority:", "", ...items, "", "Reply to the sender's email address to answer them."].join("\n");
}

export function digestWhatsApp(ranked, briefing) {
  const top = ranked.slice(0, 3).map((l, i) => `${i + 1}) ${LABEL[l.triage.priority]} ${l.name}: ${short(l.triage.summary, 110)}`);
  return `📬 ${briefing}\n\n${top.join("\n")}${ranked.length > 3 ? `\n+${ranked.length - 3} more in your email` : ""}`;
}
