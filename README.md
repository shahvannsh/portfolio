# Vannsh Shah — Portfolio (React + Tailwind + Framer Motion)

A dark, HUD/terminal-themed personal portfolio built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (scroll reveals, magnetic hover, sticky stacking project cards)
- lucide-react (icons)

## Local development

```bash
npm install
npm run dev
```

Visit the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Vercel auto-detects Vite — leave the default build command (`npm run build`) and output directory (`dist`).
4. Deploy.

## Editing content

All real content (experience, projects, certifications, skills) lives in one place:

```
src/data/content.ts
```

Edit that file to update anything on the site — no need to touch the components themselves for text changes.

## Structure

```
src/
  components/   All UI sections (Hero, Journey, Projects, Contact, etc.)
  data/         content.ts — single source of truth for all copy
  index.css     Global styles, fonts, custom Tailwind tokens
  App.tsx       Wires all sections together
```


## NFC card page (`/card`) — setup notes

Write this link to the NFC tag (the UTM tags let Vercel Web Analytics count taps):
`https://portfolio-mu-ruby-37.vercel.app/card?utm_source=nfc&utm_medium=card`

| Feature | What to do |
| --- | --- |
| Tap analytics | Enable **Web Analytics** for the project in Vercel (the script is already in `index.html` and `card.html`). Custom events need a Vercel plan that supports them; page views and UTM sources work on the free plan. |
| "Leave your details" form | Add `RESEND_API_KEY` (and optionally `LEAD_TO`) in Vercel → Settings → Environment Variables. Without it the form offers an email/WhatsApp fallback. Code: `api/lead.js`. |
| Optional AI chatbot fallback | Add `ANTHROPIC_API_KEY` and set `VITE_AI_CHAT=true`, then redeploy. The built-in chatbot answers first; the AI is only asked when it doesn't know, and it can only use the facts in `api/_knowledge.json`. Code: `api/chat.js`. |
| After editing `knowledge.ts` or `content.ts` | `npm run export-knowledge` (refreshes `api/_knowledge.json`). |
| Resume | Edit `src/data/resume.json`, then `npm run resume` (a GitHub Action does this on push). A test fails if the resume, site and chatbot disagree. |
| Captions, contact photo, QR code | `npm run assets` regenerates `public/intro.vtt`, `public/contact.vcf` and `public/card-qr.svg`. |
| Project results | Fill the empty `result` field of a project in `content.ts` (for example `"Cuts study-planning time from 30 to 5 minutes"`); it appears on the project card. |
| Self-host fonts (optional) | `npm run fonts` downloads the Google fonts into `public/fonts/` and removes Google from the CSP. Needs internet once. |
| Check the live site | `npm run verify` tests the deployed headers, files and API protections. |
| Festival greetings | Dates live in `src/data/festivals.ts` (2026–2027 listed); add new years there. |

Copy `.env.example` for the full list of environment variables. Never commit real keys.


## Security

See [SECURITY.md](SECURITY.md) for how to report a problem, what protects the site, and the steps you must do yourself
(two-factor authentication, branch protection, a Vercel rate-limit rule, key rotation).

- `vercel.json` sets a strict Content-Security-Policy and other security headers. The pages have **no inline scripts**; keep it that way (`tests/security-config.test.ts` fails if one appears).
- If you add a third-party script, image host, font or API, add it to the CSP in `vercel.json` on purpose, and update the test.
- `api/_security.js` guards both endpoints (POST/JSON only, size limits, same-site origin, rate limits). Don't bypass it.
- Secrets live only in Vercel environment variables. Never use a `VITE_` prefix for a secret: those values are public.
- CI runs CodeQL, `npm audit`, secret scanning and Dependabot.

Step-by-step launch list: [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md).
