import { useCallback, useEffect, useRef, useState } from "react";

type Alternative = { transcript: string };
type Result = ArrayLike<Alternative> & { isFinal: boolean };
type ResultEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: ResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const voiceInputSupported = () => recognitionCtor() !== null;

export function describeVoiceError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "The microphone is blocked. Allow it in your browser's settings and try again.";
    case "no-speech":
      return "I didn't hear anything. Tap the mic and try again.";
    case "audio-capture":
      return "No microphone was found.";
    case "network":
      return "The browser's speech service couldn't be reached.";
    case "language-not-supported":
      return "This browser can't understand that language by voice.";
    default:
      return "Voice input isn't working right now. You can type instead.";
  }
}

export type VoiceEnd = { heard: boolean; error: string | null };

/** Free, in-browser speech-to-text (the Web Speech API). Calls `onFinal` once per spoken question. */
export function useVoiceChat({ lang, onFinal, onEnd }: { lang: string; onFinal: (text: string) => void; onEnd?: (end: VoiceEnd) => void }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const callbacks = useRef({ onFinal, onEnd });
  const language = useRef(lang);

  useEffect(() => {
    callbacks.current = { onFinal, onEnd };
    language.current = lang;
  });

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || recognition.current) return;
    setError("");
    setInterim("");

    const rec = new Ctor();
    rec.lang = language.current;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let heard = false;
    let failure: string | null = null;
    rec.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText.trim()) {
        heard = true;
        setInterim("");
        callbacks.current.onFinal(finalText.trim());
      } else {
        setInterim(interimText);
      }
    };
    rec.onerror = (event) => {
      if (event.error === "aborted") return;
      failure = event.error;
      setError(describeVoiceError(event.error));
    };
    rec.onend = () => {
      if (recognition.current === rec) recognition.current = null;
      setListening(false);
      setInterim("");
      callbacks.current.onEnd?.({ heard, error: failure });
    };

    recognition.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      recognition.current = null;
      setError(describeVoiceError(""));
      callbacks.current.onEnd?.({ heard: false, error: "start-failed" });
    }
  }, []);

  const stop = useCallback(() => {
    recognition.current?.stop();
  }, []);

  useEffect(
    () => () => {
      const rec = recognition.current;
      if (rec) {
        rec.onend = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.abort();
        recognition.current = null;
      }
    },
    [],
  );

  return { supported: voiceInputSupported(), listening, interim, error, start, stop };
}
