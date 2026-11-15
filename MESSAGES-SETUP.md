# Get "Leave your details" messages into your inbox and WhatsApp

**Why it didn't work before:** the form is only the front door. Nothing was connected behind it, so there was nowhere to
send the message. These steps connect it. Do **A** first (that alone makes it work), then add the rest as you like.

| Step | What it gives you | Cost | Required? |
| --- | --- | --- | --- |
| A. Email (Resend) | Every message lands in your inbox | Free | **Yes** |
| B. Database (Upstash Redis) | Messages are saved so you can track them, and "busy hour" digests work | Free | Recommended |
| C. AI agent (Anthropic) | Each message is ranked urgent / high / normal / low / spam and summarised, with a suggested reply | A few cents per month | Recommended |
| D. WhatsApp alerts | A WhatsApp ping for urgent and high messages and for every digest | Free (CallMeBot) | Optional |
| E. Daily summary | A ranked summary every morning at 8:00 (India time) | Free | Optional |

You add the keys in **Vercel → your project → Settings → Environment Variables**, then press **Redeploy**.
Never paste keys into code or GitHub.

## A. Email (required)
1. Create a free account at <https://resend.com>. **Sign up with the email address you want messages sent to** (for example your Gmail). With the free sender, Resend only delivers to the address you signed up with.
2. In Resend, create an **API key** and copy it.
3. In Vercel add `RESEND_API_KEY` = that key. (Optional: `LEAD_TO` = where to deliver, if different.)
4. Redeploy, then run `npm run test-lead`. You should see "Status 200" and a message in your inbox (check spam the first time).

## B. Database for tracking (recommended)
1. In Vercel: **Storage** (or **Marketplace**) → add **Upstash Redis** (free plan) → connect it to this project.
2. Vercel fills in `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_…` pair) for you. Redeploy.
3. Every message is now saved for 90 days. You can browse them in the Upstash console (Data Browser, keys starting `lead:`).

## C. AI agent (recommended)
1. Get an API key at <https://console.anthropic.com>, and **set a monthly spending limit** there.
2. Add `ANTHROPIC_API_KEY` in Vercel. Redeploy.
3. The agent now reads each message and decides its priority, writes a one-line summary and drafts a reply. If it ever fails, simple built-in rules rank the message instead, so nothing is lost.

## D. WhatsApp alerts (optional)
Pick **one**:
- **CallMeBot (easiest, personal use):** follow the 2-minute setup at <https://www.callmebot.com/blog/free-api-whatsapp-messages/> to get an API key for your number, then add `CALLMEBOT_APIKEY`. Note: the alert text passes through CallMeBot's service, so it only carries a short summary (never the full message).
- **Official WhatsApp Cloud API (Meta):** add `WHATSAPP_CLOUD_TOKEN` and `WHATSAPP_PHONE_ID`. Meta only lets a business number message you freely within 24 hours of you messaging it, so it suits people who already use a WhatsApp Business setup.

The number is `LEAD_WHATSAPP_TO` (already set to yours by default).

## E. Daily summary (optional)
Add `CRON_SECRET` = any long random text (for example 30 random characters). Vercel then runs `/api/digest` every day at 08:00 India time and sends you one ranked summary of everything still waiting.

## How it decides what to send ("as per traffic")
| Situation | What you get |
| --- | --- |
| A message the agent ranks **urgent or high** | Sent to you **immediately** (email, plus WhatsApp if set up) |
| A normal or low message while it's **quiet** (3 or fewer in the last hour) | Sent **immediately** by email |
| A normal or low message in a **busy hour** (more than 3 in an hour) | **Held**, then sent together as **one ranked digest** when 5 are waiting, or at the next daily summary |
| **Spam** | Saved for your records, **never sent** to you |

Change the numbers with `IMMEDIATE_MAX` (default 3) and `DIGEST_BATCH` (default 5) in Vercel.

Each digest starts with a short briefing from the AI ("5 messages arrived; the second is a recruiter wanting an interview, reply to that first…"), then lists every message ranked, with a suggested reply. You answer by replying to the sender's own email address.

## Safety of the agent
Visitors can't take control of it: their message is treated as data, a message that tries to give the AI orders is capped at "normal" and flagged with a warning, the AI's output is checked and stripped of links, and it can't send anything except to you.

## Privacy
Messages are kept for up to 90 days in your own Upstash database, and (if you add step C) the text is read by Anthropic's API to rank it. The form says so. Delete the database or remove the keys to stop either.
