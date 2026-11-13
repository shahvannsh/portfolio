# Deploy checklist (do these in order)

## 1. On your computer
- [ ] Replace the repo files with this project, then delete the leftovers you don't need (`portfolio/`, `.kilo/`, the stray `WhatsApp Image…jpg`, `characters/` if unused).
- [ ] `npm install` (Node 22+), then `npm run build` and `npm run test`. Fix or tell me about anything red.
- [ ] Commit `package-lock.json` too (CI uses `npm ci`).
- [ ] Optional, needs internet: `npm run fonts` (self-hosts the Google fonts and tightens the CSP), then commit `public/fonts/`.

## 2. On GitHub
- [ ] Turn on two-factor authentication.
- [ ] Settings → Branches: protect `main` (require pull requests + passing checks).
- [ ] Settings → Code security: enable secret scanning and push protection, Dependabot alerts, and code scanning.

## 3. On Vercel
- [ ] Turn on two-factor authentication.
- [ ] Settings → Environment Variables: add `RESEND_API_KEY` (and `LEAD_TO` if not your Gmail). Leave the AI variables unset unless you want the AI chatbot fallback.
- [ ] Analytics → enable **Web Analytics**.
- [ ] Firewall → add a rate-limit rule for `/api/*` (for example 10 requests/minute per IP).
- [ ] Redeploy, then check the deployment's logs for errors.

## 4. Verify the live site
- [ ] `npm run verify` (all checks must pass).
- [ ] Open `/card` on your phone: greeting bubble, video, music, "Ask me", Share (QR), "Leave your details" (send yourself one), Save Contact (check your photo shows in Contacts).
- [ ] Open `/` and try the chatbot, the intro video and the music button.

## 5. Write the NFC tag
- [ ] URL: `https://portfolio-mu-ruby-37.vercel.app/card?utm_source=nfc&utm_medium=card`
- [ ] Test on an Android phone and an iPhone before locking the tag.

## 6. Fill in later
- [ ] One-line **result** for each project (`result` in `src/data/content.ts`).
- [ ] Ask a native speaker to check the Sanskrit, Marathi, Gujarati and Japanese greetings (`src/data/greetings.ts`).
- [ ] Confirm the DocParserEnvs description (Ollama Qwen) and the Chotu description match your repos.
- [ ] After editing `knowledge.ts` or `content.ts`: `npm run export-knowledge`. After editing the resume: `npm run resume`.
