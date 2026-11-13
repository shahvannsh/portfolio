import { useEffect, useRef } from "react";
import type { Greeting } from "../data/greetings";

const LOCALES: Record<string, string> = {
  en: "en",
  hi: "hi",
  mr: "mr",
  gu: "gu",
  de: "de",
  ja: "ja",
  sa: "hi", // no Sanskrit voices exist; a Hindi voice reads Devanagari fine
};

export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function voiceFor(lang: string) {
  const wanted = LOCALES[lang] ?? "en";
  return (
    window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(wanted)) ?? null
  );
}

/**
 * Says each greeting aloud in its own language while `enabled`. If the device has no voice for a language,
 * that greeting is skipped silently rather than being read out wrongly by an English voice.
 */
export function useSpokenGreeting(enabled: boolean, greeting: Greeting | null) {
  const keep = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!enabled || !greeting || !speechAvailable()) {
      return;
    }
    const synth = window.speechSynthesis;
    const voice = voiceFor(greeting.lang);
    if (!voice) {
      return;
    }
    synth.cancel();
    // Chrome drops a speak() issued right after cancel(), so wait a beat.
    const timer = window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(greeting.text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.95;
      keep.current = utterance;
      synth.speak(utterance);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [enabled, greeting]);

  useEffect(() => {
    if (!enabled && speechAvailable()) {
      window.speechSynthesis.cancel();
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (speechAvailable()) window.speechSynthesis.cancel();
    };
  }, []);
}
