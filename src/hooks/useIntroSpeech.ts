import { useCallback, useEffect, useRef, useState } from "react";
import type { Reaction } from "../components/Mascot";

export type IntroLine = { text: string; pose: Reaction };
export type IntroStatus = "idle" | "speaking" | "done";

function isSupported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === "en-in") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

export function useIntroSpeech(lines: readonly IntroLine[]) {
  const supported = isSupported();
  const [status, setStatus] = useState<IntroStatus>("idle");
  const [index, setIndex] = useState(-1);
  const runRef = useRef(0);

  const stop = useCallback(() => {
    runRef.current += 1;
    if (isSupported()) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
    setIndex(-1);
  }, []);

  const start = useCallback(() => {
    if (!isSupported()) {
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    runRef.current += 1;
    const run = runRef.current;
    setStatus("speaking");

    const speak = (i: number) => {
      if (run !== runRef.current) {
        return;
      }
      if (i >= lines.length) {
        setStatus("done");
        setIndex(-1);
        return;
      }
      setIndex(i);
      const utterance = new SpeechSynthesisUtterance(lines[i].text);
      const voice = pickVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 1;
      utterance.pitch = 1.1;
      utterance.onend = () => speak(i + 1);
      utterance.onerror = () => {
        if (run === runRef.current) {
          setStatus("idle");
          setIndex(-1);
        }
      };
      synth.speak(utterance);
    };

    speak(0);
  }, [lines]);

  useEffect(() => {
    const halt = () => {
      if (isSupported()) {
        window.speechSynthesis.cancel();
      }
    };
    window.addEventListener("pagehide", halt);
    return () => {
      window.removeEventListener("pagehide", halt);
      runRef.current += 1;
      halt();
    };
  }, []);

  return { supported, status, line: index >= 0 ? lines[index] : null, index, start, stop };
}
