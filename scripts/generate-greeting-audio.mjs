// Creates natural-sounding audio clips of every greeting with a cloud text-to-speech service, so the page can play
// them on ANY phone, including ones with no Marathi, Gujarati or Sanskrit voice. Run it once on your computer.
//
//   Google (free tier is plenty):  GOOGLE_TTS_API_KEY=...  npm run greetings:generate
//   Microsoft Azure (free tier):   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=centralindia  npm run greetings:generate
//   (Windows PowerShell:  $env:GOOGLE_TTS_API_KEY="..."; npm run greetings:generate)
//
// Options: --languages mr,gu,sa   only these languages     --kinds hello,welcome   only these phrases
//          --force                 replace existing clips    --no-process            don't convert/add to the page
//          --list-voices mr        show the voices Google offers for a language
// Clips you recorded yourself (recordings/greetings/<lang>-<phrase>.*) are never overwritten unless you use --force.
// Sanskrit has no text-to-speech voice anywhere, so a Hindi voice reads it; record it yourself for the best result.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const root = resolve(opt("--root", join(dirname(fileURLToPath(import.meta.url)), "..")));
const only = (name) => (opt(name, "") ? new Set(opt(name, "").split(",").map((s) => s.trim())) : null);
const onlyLanguages = only("--languages");
const onlyKinds = only("--kinds");
const outDir = resolve(opt("--out", join(root, "recordings/greetings")));

const GOOGLE_BASE = process.env.GOOGLE_TTS_BASE || "https://texttospeech.googleapis.com";
const AZURE_REGION = process.env.AZURE_SPEECH_REGION || "centralindia";
const AZURE_BASE = process.env.AZURE_TTS_BASE || `https://${AZURE_REGION}.tts.speech.microsoft.com`;

// Best voices first. If Google rejects a name we try the next one, and finally any voice for the language.
const GOOGLE = {
  en: { code: "en-IN", names: ["en-IN-Neural2-B", "en-IN-Wavenet-B", "en-IN-Standard-B"] },
  hi: { code: "hi-IN", names: ["hi-IN-Neural2-B", "hi-IN-Wavenet-B", "hi-IN-Standard-B"] },
  mr: { code: "mr-IN", names: ["mr-IN-Wavenet-B", "mr-IN-Standard-B"] },
  gu: { code: "gu-IN", names: ["gu-IN-Wavenet-B", "gu-IN-Standard-B"] },
  de: { code: "de-DE", names: ["de-DE-Neural2-B", "de-DE-Wavenet-B", "de-DE-Standard-B"] },
  ja: { code: "ja-JP", names: ["ja-JP-Neural2-C", "ja-JP-Wavenet-C", "ja-JP-Standard-C"] },
  sa: { code: "hi-IN", names: ["hi-IN-Neural2-B", "hi-IN-Wavenet-B", "hi-IN-Standard-B"] }, // no Sanskrit voices exist
};
const AZURE = {
  en: { code: "en-IN", voice: "en-IN-PrabhatNeural" },
  hi: { code: "hi-IN", voice: "hi-IN-MadhurNeural" },
  mr: { code: "mr-IN", voice: "mr-IN-ManoharNeural" },
  gu: { code: "gu-IN", voice: "gu-IN-NiranjanNeural" },
  de: { code: "de-DE", voice: "de-DE-ConradNeural" },
  ja: { code: "ja-JP", voice: "ja-JP-KeitaNeural" },
  sa: { code: "hi-IN", voice: "hi-IN-MadhurNeural" },
};

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const escapeXml = (text) => text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Fatal extends Error {}

async function request(url, init, label) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, init);
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    const detail = (await response.text().catch(() => "")).slice(0, 200);
    if (response.status === 401 || response.status === 403) {
      throw new Fatal(`${label} refused the key (${response.status}). Check the key and that the Text-to-Speech / Speech service is enabled. ${detail}`);
    }
    const error = new Error(`${label} error ${response.status}: ${detail}`);
    error.status = response.status;
    throw error;
  }
}

async function googleSpeak(text, lang, key) {
  const { code, names } = GOOGLE[lang];
  let lastError;
  for (const name of [...names, null]) {
    try {
      const response = await request(
        `${GOOGLE_BASE}/v1/text:synthesize?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: name ? { languageCode: code, name } : { languageCode: code, ssmlGender: "MALE" },
            audioConfig: { audioEncoding: "MP3", speakingRate: lang === "en" || lang === "de" ? 1 : 0.92 },
          }),
        },
        "Google Text-to-Speech",
      );
      const { audioContent } = await response.json();
      if (!audioContent) throw new Error("Google returned no audio");
      return Buffer.from(audioContent, "base64");
    } catch (error) {
      if (error instanceof Fatal || (error.status && error.status !== 400)) throw error;
      lastError = error; // an unknown voice name (400): try the next one
    }
  }
  throw lastError;
}

async function azureSpeak(text, lang, key) {
  const { code, voice } = AZURE[lang];
  const ssml = `<speak version="1.0" xml:lang="${code}"><voice xml:lang="${code}" name="${voice}"><prosody rate="${lang === "en" || lang === "de" ? "0%" : "-8%"}">${escapeXml(text)}</prosody></voice></speak>`;
  const response = await request(
    `${AZURE_BASE}/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "portfolio-greetings",
      },
      body: ssml,
    },
    "Azure Speech",
  );
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  if (flag("--list-voices")) {
    const key = process.env.GOOGLE_TTS_API_KEY;
    if (!key) throw new Fatal("Set GOOGLE_TTS_API_KEY to list voices.");
    const lang = opt("--list-voices", "hi");
    const response = await request(`${GOOGLE_BASE}/v1/voices?languageCode=${GOOGLE[lang]?.code ?? lang}&key=${encodeURIComponent(key)}`, {}, "Google Text-to-Speech");
    for (const v of (await response.json()).voices ?? []) console.log(`${v.name}  ${v.ssmlGender}`);
    return;
  }

  const google = process.env.GOOGLE_TTS_API_KEY;
  const azure = process.env.AZURE_SPEECH_KEY;
  const provider = opt("--provider", google ? "google" : azure ? "azure" : "");
  if (!provider) {
    throw new Fatal("No key found. Set GOOGLE_TTS_API_KEY (Google) or AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (Azure). See VOICE-SETUP.md.");
  }
  const key = provider === "google" ? google : azure;
  if (!key) throw new Fatal(`The ${provider} key isn't set.`);
  const speak = provider === "google" ? googleSpeak : azureSpeak;

  const { LANGUAGES } = await import(pathToFileURL(join(root, "src/data/greetings.ts")).href);
  mkdirSync(outDir, { recursive: true });
  const existing = readdirSync(outDir);

  let made = 0;
  let skipped = 0;
  for (const language of LANGUAGES) {
    if (onlyLanguages && !onlyLanguages.has(language.lang)) continue;
    for (const phrase of language.phrases) {
      const slug = slugify(phrase.meaning);
      if (onlyKinds && !onlyKinds.has(slug)) continue;
      const base = `${language.lang}-${slug}`;
      if (!flag("--force") && existing.some((f) => f.toLowerCase().startsWith(`${base}.`))) {
        skipped += 1; // you already have a clip (maybe your own recording)
        continue;
      }
      const audio = await speak(phrase.text, language.lang, key);
      writeFileSync(join(outDir, `${base}.mp3`), audio);
      console.log(`  made ${base}.mp3  (${language.language}: ${phrase.text})`);
      made += 1;
      await sleep(150);
    }
  }
  console.log(`Made ${made} clip(s); kept ${skipped} that already existed. Provider: ${provider}.`);

  if (!flag("--no-process") && made + skipped > 0) {
    const script = join(root, "scripts/prepare-greetings.py");
    if (existsSync(script)) {
      try {
        execFileSync("python3", [script, "--root", root, "--input", outDir], { stdio: "inherit" });
      } catch {
        console.log("Couldn't run the conversion step automatically. Run `npm run greetings`, then commit public/greetings/.");
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Fatal ? error.message : `Failed: ${error.message}`);
  process.exit(1);
});
