# Security policy

## Reporting a vulnerability

Please email **shahvannsh@gmail.com** with the details and steps to reproduce. Don't open a public issue for a
vulnerability. I'll acknowledge within a few days and fix confirmed issues quickly. Please don't test with real
visitors' data, run denial-of-service tests, or use social engineering.

## What protects this site

| Layer | Protection |
| --- | --- |
| Browser | A strict Content-Security-Policy (`vercel.json`): no inline or third-party scripts, no `eval`, no framing, and `connect-src 'self'` so injected code can't send data to another site. Also HSTS, `nosniff`, `X-Frame-Options: DENY`, a locked-down Permissions-Policy, and COOP. |
| Code | React escapes all output. No `innerHTML`, `eval` or `dangerouslySetInnerHTML` (a test fails if one appears). All links pass through `safeHref`. External links use `rel="noopener noreferrer"`. |
| API (`/api/lead`, `/api/chat`) | POST only; JSON only; small bodies; same-site Origin / `Sec-Fetch-Site` checks; strict input cleaning; honeypot, speed and link-spam traps; per-visitor and global rate limits; generic error messages; `no-store` caching. |
| AI endpoint | Off by default. Answers only from `api/_knowledge.json`; output links are restricted to an allow-list; spend is capped. |
| Secrets | Only in Vercel environment variables, never in the repo or the browser bundle (`.env*` is git-ignored and tests scan for key patterns). |
| Supply chain | Dependabot, CodeQL, `npm audit` and secret scanning in CI; workflows run with least privilege. |

## Do these yourself (cannot be done from code)

1. Turn on **two-factor authentication** for GitHub, Vercel, Resend and your Anthropic account, and for the email account that can reset them.
2. In GitHub → Settings → Branches, **protect `main`** (require pull requests and passing checks), and enable **secret scanning + push protection**.
3. In Vercel → Firewall, add a **rate-limit rule** for `/api/*` (for example 10 requests per minute per IP) and enable **Attack Challenge Mode** if you're ever under attack.
4. Create API keys with the **minimum scope** and a **spending limit**, store them only as Vercel environment variables, and **rotate** any key that might have leaked.
5. Keep dependencies updated (merge Dependabot pull requests) and re-run `npm audit`.

## After deploying

Run `npm run verify` against the live site. It checks the security headers, the key files, and that the API refuses
other websites, wrong content types, oversized requests and bots. See [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md).

## What this cannot promise

No site is unhackable. This is layered defence that removes the common attacks, limits the damage of the rest, and
makes abuse expensive. Public contact details (email, phone, WhatsApp) are visible by design, so expect spam to them.
