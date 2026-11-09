import { useEffect, useState } from "react";
import { Play, RotateCcw, X } from "lucide-react";
import Mascot from "./Mascot";
import type { Reaction } from "./Mascot";
import { useIntroSpeech } from "../hooks/useIntroSpeech";
import { introScript } from "../data/intro";

const SEEN_KEY = "intro-played";
const GESTURE_MS = 1000;
const MOUTH_MS = 220;

const pill =
  "pointer-events-auto flex items-center gap-1.5 rounded-full border border-amber/40 bg-panel/90 px-3 py-1.5 font-mono text-[11px] text-ink shadow-[0_0_14px_rgba(255,122,51,0.2)] backdrop-blur-md transition-colors hover:border-amber";

function TalkingMascot() {
  const { supported, status, line, index, start, stop } = useIntroSpeech(introScript);
  const [gesturing, setGesturing] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Browsers block speech until the visitor interacts, so the intro starts on the first tap or key.
  useEffect(() => {
    if (!supported) {
      return;
    }
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        return;
      }
    } catch {
      /* storage unavailable: still offer the button */
    }

    const begin = () => {
      cleanup();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      start();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };

    window.addEventListener("pointerdown", begin, { once: true });
    window.addEventListener("keydown", begin, { once: true });
    return cleanup;
  }, [supported, start]);

  useEffect(() => {
    if (status !== "speaking") {
      return;
    }
    const gestureTimer = window.setTimeout(() => setGesturing(false), GESTURE_MS);
    setGesturing(true);
    return () => window.clearTimeout(gestureTimer);
  }, [status, index]);

  useEffect(() => {
    if (status !== "speaking") {
      return;
    }
    const mouth = window.setInterval(() => setMouthOpen((open) => !open), MOUTH_MS);
    return () => {
      window.clearInterval(mouth);
      setMouthOpen(false);
    };
  }, [status]);

  const speaking = status === "speaking";
  let pose: Reaction | null = null;
  if (speaking && line) {
    pose = gesturing ? line.pose : mouthOpen ? "surprised" : null;
  }

  return (
    <div className="relative">
      <Mascot
        directions="/mascots/vannsh-directions.webp"
        reactions="/mascots/vannsh-reactions.webp"
        size={95}
        label="Vannsh chibi mascot"
        pose={pose}
        talking={speaking}
      />
      {supported && (
        <div className="pointer-events-none absolute right-full top-1/2 mr-3 flex -translate-y-1/2 justify-end">
          {speaking ? (
            <div className="pointer-events-auto w-[min(240px,58vw)] rounded-xl border border-amber/40 bg-panel/90 px-3 py-2 font-mono text-xs leading-snug text-ink shadow-[0_0_14px_rgba(255,122,51,0.2)] backdrop-blur-md">
              <p aria-live="polite">{line?.text}</p>
              <button
                type="button"
                onClick={stop}
                aria-label="Stop intro"
                className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest text-mute hover:text-amber"
              >
                <X size={11} aria-hidden="true" />
                Stop
              </button>
            </div>
          ) : (
            <button type="button" onClick={start} className={`${pill} whitespace-nowrap`}>
              {status === "done" ? (
                <RotateCcw size={12} aria-hidden="true" />
              ) : (
                <Play size={12} aria-hidden="true" />
              )}
              {status === "done" ? "Replay intro" : "Hear my intro"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TalkingMascot;
