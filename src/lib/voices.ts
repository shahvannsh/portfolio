export type VoiceLike = { name: string; lang: string; localService?: boolean; default?: boolean };

/** The accent we'd most like for each greeting language. Sanskrit has no voices anywhere, so a Hindi voice reads it. */
export const LOCALE: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", de: "de-DE", ja: "ja-JP", sa: "hi-IN" };

// For English any accent is fine, but Indian English sounds right on this site.
const ENGLISH_PREFERENCE: Record<string, number> = { "en-in": 100, "en-gb": 72, "en-us": 66 };

const NEURAL = /natural|neural|premium|enhanced|wavenet|siri|online|studio/i;
const BAD = /espeak|compact|novelty|robot|zarvox|whisper|bells|bad news|good news|bubbles|cellos|trinoids|albert|fred|junior|organ|boing|deranged|hysterical|superstar/i;

const norm = (lang: string) => lang.replace("_", "-").toLowerCase();

/** Higher is better; null means the voice can't speak this language. */
export function scoreVoice(voice: VoiceLike, lang: string): number | null {
  const wanted = norm(LOCALE[lang] ?? "en-IN");
  const have = norm(voice.lang);
  const base = wanted.split("-")[0];
  if (have.split("-")[0] !== base) return null;

  let score = have === wanted ? 100 : base === "en" ? (ENGLISH_PREFERENCE[have] ?? 55) : 60;
  if (NEURAL.test(voice.name)) score += 30; // the natural-sounding voices
  if (/google/i.test(voice.name)) score += 12;
  if (BAD.test(voice.name)) score -= 50; // robotic or novelty voices
  if (voice.localService) score += 5; // no network delay
  if (voice.default) score += 3;
  return score;
}

/** The most natural-sounding voice this device has for a language, or null if it has none. */
export function pickBestVoice<T extends VoiceLike>(voices: readonly T[], lang: string): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const voice of voices) {
    const score = scoreVoice(voice, lang);
    if (score !== null && score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

/** "How are you?" -> "how-are-you" (the name used for recorded clips: hi-how-are-you.mp3). */
export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
