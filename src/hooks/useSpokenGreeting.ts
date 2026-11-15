import { useEffect, useRef, useState } from "react";
import type { Greeting } from "../data/greetings";
import { LOCALE, pickBestVoice, slugify } from "../lib/voices";

/** Speaking pace per language (a little slower than normal is clearer for a greeting). */
const RATE: Record<string, number> = { en: 1, hi: 0.92, mr: 0.92, gu: 0.92, de: 1, ja: 0.95, sa: 0.85 };

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
    const refresh = () => setVoices((previous) => {
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
 * natural voice the device has for that language. `missing` is true when neither exists, so the page can say so
 * instead of staying silent without explanation.
 */
export function useSpokenGreeting(enabled: boolean, greeting: Greeting | null) {
  const voices = useVoices();
  const [missing, setMissing] = useState(false);
  const clip = useRef<HTMLAudioElement | null>(null);
  const keep = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpoken = useRef("");

  const stopAll = () => {
    clip.current?.pause();
    clip.current = null;
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
    const timer = window.setTimeout(async () => {
      const manifest = await loadManifest();
      if (cancelled) return;
      stopAll();

      const file = manifest[greeting.lang]?.[slugify(greeting.meaning)];
      if (file) {
        setMissing(false);
        lastSpoken.current = key;
        const audio = new Audio(`/greetings/${file}`);
        clip.current = audio;
        void audio.play()?.catch?.(() => undefined);
        return;
      }

      const voice = speechAvailable() ? pickBestVoice(voices, greeting.lang) : null;
      setMissing(!voice);
      if (!voice) return;
      lastSpoken.current = key;
      const utterance = new SpeechSynthesisUtterance(greeting.text);
      utterance.voice = voice;
      utterance.lang = voice.lang || LOCALE[greeting.lang];
      utterance.rate = RATE[greeting.lang] ?? 1;
      utterance.pitch = 1;
      keep.current = utterance; // keeps it from being garbage-collected mid-sentence
      window.speechSynthesis.speak(utterance);
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
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
