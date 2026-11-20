import { pickBestVoice } from "./voices";

const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** Which of our greeting languages a piece of text is written in (Devanagari is treated as Hindi). */
export function guessLang(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) return "ja";
  return "en";
}

/** Turns a chat answer into something pleasant to hear: no emoji, bullets or links, and only the first few sentences. */
export function forSpeech(text: string, maxChars = 320): string {
  const plain = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/^[\s]*[•\-*]\s*/gm, "")
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/\.\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = plain.match(/[^.!?।]+[.!?।]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  let out = "";
  let count = 0;
  for (const sentence of sentences) {
    if (count >= 3 || (out && (out + " " + sentence).length > maxChars)) break;
    out = out ? `${out} ${sentence}` : sentence;
    count += 1;
  }
  return out.length > maxChars ? `${out.slice(0, maxChars - 1).trimEnd()}…` : out;
}

/**
 * Reads a chat answer aloud with the best voice the device has, then calls `onDone` (also when nothing can be said, so a
 * conversation never stalls). Returns a function that stops it.
 */
export function speakReply(text: string, onDone: () => void): () => void {
  const spoken = forSpeech(text);
  const lang = guessLang(spoken);
  const voice = canSpeak() ? pickBestVoice(window.speechSynthesis.getVoices(), lang) : null;
  // Never read Hindi, Gujarati or Japanese with an English voice.
  if (!spoken || !canSpeak() || (!voice && lang !== "en")) {
    onDone();
    return () => undefined;
  }

  const synth = window.speechSynthesis;
  let finished = false;
  let safety = 0;
  let start = 0;
  const done = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(safety);
    window.clearTimeout(start);
    onDone();
  };

  const utterance = new SpeechSynthesisUtterance(spoken);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-IN";
  }
  utterance.rate = 1;
  utterance.onend = done;
  utterance.onerror = done;

  const busy = synth.speaking || synth.pending;
  if (busy) synth.cancel();
  start = window.setTimeout(() => synth.speak(utterance), busy ? 120 : 0); // Chrome drops a speak() right after cancel()
  safety = window.setTimeout(done, Math.max(6000, spoken.length * 120)); // some browsers never report the end

  return () => {
    finished = true;
    window.clearTimeout(safety);
    window.clearTimeout(start);
    synth.cancel();
  };
}
