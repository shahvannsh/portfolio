import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction, Motion, Reaction } from "../components/Mascot";

export type Gesture =
  | "greet"
  | "love"
  | "cheer"
  | "sparkle"
  | "wink"
  | "geek"
  | "wow"
  | "thanks"
  | "celebrate"
  | "shrug"
  | "welcome"
  | "dance"
  | "daydream"
  | "wake"
  | "curious";

type Step = {
  at: number;
  pose?: Reaction | null;
  look?: Direction | null;
  motion?: Motion["type"];
};

const SCRIPTS: Record<Gesture, Step[]> = {
  greet: [
    { at: 0, pose: "delighted", motion: "hop" },
    { at: 1400, pose: "wink", motion: "nod" },
    { at: 2500, pose: null, look: "down" },
    { at: 4500, look: null },
  ],
  love: [
    { at: 0, pose: "heart", motion: "hop" },
    { at: 1500, pose: null },
  ],
  cheer: [
    { at: 0, pose: "delighted", motion: "nod" },
    { at: 1200, pose: null },
  ],
  sparkle: [
    { at: 0, pose: "sparkle", motion: "hop" },
    { at: 1500, pose: null },
  ],
  thanks: [
    { at: 0, pose: "delighted", motion: "hop" },
    { at: 900, pose: "heart" },
    { at: 2200, pose: null },
  ],
  wink: [
    { at: 0, pose: "wink", motion: "nod" },
    { at: 1200, pose: null },
  ],
  geek: [
    { at: 0, pose: "sparkle", motion: "tilt" },
    { at: 1500, pose: null },
  ],
  wow: [
    { at: 0, pose: "surprised", motion: "hop" },
    { at: 1000, pose: "delighted", motion: "wiggle" },
    { at: 1900, pose: null },
  ],
  celebrate: [
    { at: 0, pose: "delighted", motion: "hop2" },
    { at: 1000, pose: "heart", motion: "sway" },
    { at: 2500, pose: "sparkle", motion: "spin" },
    { at: 3500, pose: null },
  ],
  shrug: [
    { at: 0, pose: "bashful", look: "down-left", motion: "tilt" },
    { at: 1700, pose: null, look: null },
  ],
  welcome: [
    { at: 0, pose: "surprised", motion: "hop" },
    { at: 800, pose: "wink", motion: "nod" },
    { at: 1900, pose: null },
  ],
  dance: [
    { at: 0, pose: "delighted", motion: "sway" },
    { at: 1300, pose: "wink", motion: "sway" },
    { at: 2600, pose: "sparkle", motion: "spin" },
    { at: 3500, pose: null },
  ],
  daydream: [
    { at: 0, look: "up", pose: null, motion: "tilt" },
    { at: 1400, look: "up-right" },
    { at: 2800, look: null, motion: "wiggle" },
  ],
  wake: [
    { at: 0, pose: "surprised", motion: "hop" },
    { at: 900, pose: "blink" },
    { at: 1100, pose: null },
  ],
  curious: [
    { at: 0, look: "left", motion: "tilt" },
    { at: 900, look: "right" },
    { at: 1800, look: "up-right" },
    { at: 2600, look: null, motion: "nod" },
  ],
};

const BLINK_EVERY_MS = 4200;
const CURIOUS_AFTER_MS = 9000;
const DAYDREAM_AFTER_MS = 14500;
const SLEEP_AFTER_MS = 22000;

/**
 * Drives the mascot's gestures: named one-shot gestures plus idle behaviour
 * (blinks, a curious look around, falling asleep, waking up on touch).
 */
export function useMascotPerformer() {
  const [pose, setPose] = useState<Reaction | null>(null);
  const [look, setLook] = useState<Direction | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);

  const gestureTimers = useRef<number[]>([]);
  const idleTimers = useRef<number[]>([]);
  const busy = useRef(false);
  const asleep = useRef(false);
  const counter = useRef(0);

  const perform = useCallback((gesture: Gesture) => {
    gestureTimers.current.forEach(window.clearTimeout);
    gestureTimers.current = [];
    const steps = SCRIPTS[gesture];
    busy.current = true;

    steps.forEach((step) => {
      gestureTimers.current.push(
        window.setTimeout(() => {
          if (step.pose !== undefined) setPose(step.pose);
          if (step.look !== undefined) setLook(step.look);
          if (step.motion) {
            counter.current += 1;
            setMotion({ type: step.motion, id: counter.current });
          }
        }, step.at),
      );
    });
    const end = steps[steps.length - 1].at + 150;
    gestureTimers.current.push(
      window.setTimeout(() => {
        busy.current = false;
      }, end),
    );
  }, []);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => {
      idleTimers.current.push(window.setTimeout(fn, ms));
    };

    const blinkLoop = () => {
      later(() => {
        if (!busy.current && !asleep.current) {
          setPose("blink");
          window.setTimeout(() => {
            if (!busy.current && !asleep.current) setPose(null);
          }, 160);
        }
        blinkLoop();
      }, BLINK_EVERY_MS + Math.random() * 2500);
    };

    const scheduleIdle = () => {
      idleTimers.current.forEach(window.clearTimeout);
      idleTimers.current = [];
      blinkLoop();
      later(() => {
        if (!busy.current) perform("curious");
      }, CURIOUS_AFTER_MS);
      later(() => {
        if (!busy.current) perform("daydream");
      }, DAYDREAM_AFTER_MS);
      later(() => {
        asleep.current = true;
        setPose("sleepy");
      }, SLEEP_AFTER_MS);
    };

    const onActivity = () => {
      if (asleep.current) {
        asleep.current = false;
        perform("wake");
      }
      scheduleIdle();
    };

    // Coming back to the tab: a quick hello, or a dance if they were away a while.
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt ? Date.now() - hiddenAt : 0;
      hiddenAt = 0;
      if (away > 3000) {
        asleep.current = false;
        perform(away > 20000 ? "dance" : "welcome");
        scheduleIdle();
      }
    };

    scheduleIdle();
    document.addEventListener("visibilitychange", onVisibility);
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));

    return () => {
      events.forEach((name) => window.removeEventListener(name, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      idleTimers.current.forEach(window.clearTimeout);
      gestureTimers.current.forEach(window.clearTimeout);
    };
  }, [perform]);

  return { pose, look, motion, perform };
}
