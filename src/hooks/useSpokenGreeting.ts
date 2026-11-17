import { useEffect, useRef, useState } from "react";
import type { Greeting } from "../data/greetings";
import { LOCALE, pickBestVoice, slugify } from "../lib/voices";

/** Speaking pace per language (a little slower than normal is clearer for a greeting). */
const RATE: Record<string, number> = { en: 1, hi: 0.92, mr: 0.92, gu: 0.92, de: 1, ja: 0.95, sa: 0.85 };
const PAUSE_MS = 600; // a breath between one greeting and the next
const START_DELAY_MS = 150;
const CANCEL_SETTLE_MS = 120; // Chrome drops a speak() that comes straight after cancel()

/** How long to leave a greeting on screen when nothing is spoken (time to read it). */
export const dwellMs = (text: string) => Math.max(2400, text.length * 70);

type Manifest = Record<string, Record<string, string>>;
let manifestPromise: Promise<Manifest> | null = null;

/** Clips you recorded yourself (see VOICE-SETUP.md) are listed in /greetings/manifest.json and win over robot voices. */
export function loadManifest(): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise =
      typeof fetch === "function"
        ? fetch("/greetings/manifest.json")
            .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : {}))
            .catch(() => ({}))
        : Promise.resolve({});
  }
  return manifestPromise;
}

export function resetManifestCache() {
  manifestPromise = null;
}

export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

const sameVoices = (a: SpeechSynthesisVoice[], b: SpeechSynthesisVoice[]) =>
  a.length === b.length && a.every((voice, i) => voice.name === b[i].name && voice.lang === b[i].lang);

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (speechAvailable() ? window.speechSynthesis.getVoices() : []));
  useEffect(() => {
    if (!speechAvailable()) return;
    const synth = window.speechSynthesis;
    // Only update when the list really changed, so a refresh never makes the greeting repeat.
    const refresh = () =>
      setVoices((previous) => {
        const next = synth.getVoices();
        return sameVoices(previous, next) ? previous : next;
      });
    // Browsers load their voice list a moment after the page opens, so keep listening and re-check a few times.
    synth.addEventListener?.("voiceschanged", refresh);
    const retries = [300, 1000, 2500].map((ms) => window.setTimeout(refresh, ms));
    refresh();
    return () => {
      synth.removeEventListener?.("voiceschanged", refresh);
      retries.forEach(window.clearTimeout);
    };
  }, []);
  return voices;
}

/**
 * Says each greeting aloud while `enabled`: with your own recording if you added one, otherwise with the most
 * natural voice the device has for that language. The greeting is never cut off: `onFinished` is called only once it
 * has finished (plus a short pause), and the caller moves to the next greeting then. When there's nothing to say
 * (no voice and no recording), `missing` is true and `onFinished` is called after enough time to read it.
 */
export function useSpokenGreeting(enabled: boolean, greeting: Greeting | null, onFinished?: () => void) {
  const voices = useVoices();
  const [missing, setMissing] = useState(false);
  const clip = useRef<HTMLAudioElement | null>(null);
  const keep = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpoken = useRef("");
  const finished = useRef(onFinished);

  useEffect(() => {
    finished.current = onFinished;
  });

  const stopAll = () => {
    if (clip.current) {
      clip.current.onended = null;
      clip.current.pause();
      clip.current = null;
    }
    if (speechAvailable()) window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (!enabled || !greeting) {
      setMissing(false);
      lastSpoken.current = "";
      return;
    }
    const key = `${greeting.lang}:${greeting.text}`;
    if (lastSpoken.current === key) return; // already said this one (a late voice-list update must not repeat it)

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let done = false;
    // Moves on exactly once, after `wait` ms, unless this greeting was replaced in the meantime.
    const finish = (wait: number) => {
      if (done || cancelled) return;
      done = true;
      later(() => {
        if (!cancelled) finished.current?.();
      }, wait);
    };

    later(async () => {
      const manifest = await loadManifest();
      if (cancelled) return;

      const file = manifest[greeting.lang]?.[slugify(greeting.meaning)];
      if (file) {
        stopAll();
        setMissing(false);
        lastSpoken.current = key;
        const audio = new Audio(`/greetings/${file}`);
        clip.current = audio;
        audio.onended = () => finish(PAUSE_MS);
        audio.onerror = () => finish(dwellMs(greeting.text));
        later(() => finish(0), 12000); // safety net: never get stuck on one clip
        void audio.play()?.catch?.(() => finish(dwellMs(greeting.text)));
        return;
      }

      const voice = speechAvailable() ? pickBestVoice(voices, greeting.lang) : null;
      setMissing(!voice);
      if (!voice) {
        finish(dwellMs(greeting.text));
        return;
      }

      const synth = window.speechSynthesis;
      stopAll();
      if (synth.speaking || synth.pending) await new Promise((resolve) => later(() => resolve(undefined), CANCEL_SETTLE_MS));
      if (cancelled) return;

      lastSpoken.current = key;
      const utterance = new SpeechSynthesisUtterance(greeting.text);
      utterance.voice = voice;
      utterance.lang = voice.lang || LOCALE[greeting.lang];
      utterance.rate = RATE[greeting.lang] ?? 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => finish(PAUSE_MS);
      utterance.onerror = () => finish(dwellMs(greeting.text));
      keep.current = utterance; // keeps it from being garbage-collected mid-sentence
      synth.resume?.();
      synth.speak(utterance);
      // Some browsers never report the end of an utterance: move on anyway after a generous time.
      later(() => finish(0), Math.max(5000, greeting.text.length * 350));
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, greeting, voices]);

  useEffect(() => {
    if (!enabled) stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => stopAll, []);

  return { missing };
}
