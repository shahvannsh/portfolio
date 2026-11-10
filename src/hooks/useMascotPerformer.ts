import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction, Motion, Reaction } from "../components/Mascot";
import type { Emote, EmoteKind } from "../components/MascotEmote";

export type Gesture =
  | "greet"
  | "greetNight"
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
  | "curious"
  | "scan"
  | "tickle"
  | "nudge"
  | "groove";

type Step = {
  at: number;
  pose?: Reaction | null;
  look?: Direction | null;
  motion?: Motion["type"];
  emote?: EmoteKind;
};

const RING: Direction[] = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
];

/** Which of the eight head directions points along (dx, dy), with y growing downward. */
export function directionToward(dx: number, dy: number): Direction {
  const sector = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + RING.length) % RING.length;
  return RING[sector];
}

const SCAN_STEPS: Step[] = [
  ...RING.map((look, i): Step => ({ at: i * 320, look, ...(i === 0 ? { motion: "tilt" as const } : {}) })),
  { at: RING.length * 320, look: null, pose: "surprised", emote: "question" },
  { at: RING.length * 320 + 900, pose: null },
];

const SCRIPTS: Record<Gesture, Step[]> = {
  greet: [
    { at: 0, pose: "delighted", motion: "hop", emote: "sparkle" },
    { at: 1400, pose: "wink", motion: "nod" },
    { at: 2500, pose: null, look: "down" },
    { at: 4500, look: null },
  ],
  greetNight: [
    { at: 0, pose: "sleepy", emote: "zzz" },
    { at: 1500, pose: "surprised", motion: "hop", emote: "exclaim" },
    { at: 2500, pose: "wink", motion: "nod" },
    { at: 3500, pose: null, look: "down" },
    { at: 5300, look: null },
  ],
  love: [
    { at: 0, pose: "heart", motion: "hop", emote: "heart" },
    { at: 1500, pose: null },
  ],
  cheer: [
    { at: 0, pose: "delighted", motion: "nod" },
    { at: 1200, pose: null },
  ],
  sparkle: [
    { at: 0, pose: "sparkle", motion: "hop", emote: "sparkle" },
    { at: 1500, pose: null },
  ],
  wink: [
    { at: 0, pose: "wink", motion: "nod" },
    { at: 1200, pose: null },
  ],
  geek: [
    { at: 0, pose: "sparkle", motion: "tilt", emote: "sparkle" },
    { at: 1500, pose: null },
  ],
  wow: [
    { at: 0, pose: "surprised", motion: "hop", emote: "exclaim" },
    { at: 1000, pose: "delighted", motion: "wiggle" },
    { at: 1900, pose: null },
  ],
  thanks: [
    { at: 0, pose: "delighted", motion: "hop" },
    { at: 900, pose: "heart", emote: "heart" },
    { at: 2200, pose: null },
  ],
  celebrate: [
    { at: 0, pose: "delighted", motion: "hop2", emote: "sparkle" },
    { at: 1000, pose: "heart", motion: "sway", emote: "heart" },
    { at: 2500, pose: "sparkle", motion: "spin", emote: "sparkle" },
    { at: 3500, pose: null },
  ],
  shrug: [
    { at: 0, pose: "bashful", look: "down-left", motion: "tilt", emote: "dots" },
    { at: 1700, pose: null, look: null },
  ],
  // Peekaboo: ducks out of sight, then pops back up.
  welcome: [
    { at: 0, motion: "duck" },
    { at: 1400, pose: "surprised", motion: "hop", emote: "exclaim" },
    { at: 2400, pose: "wink" },
    { at: 3200, pose: null },
  ],
  dance: [
    { at: 0, pose: "delighted", motion: "sway", emote: "music" },
    { at: 1300, pose: "wink", motion: "sway", emote: "music" },
    { at: 2600, pose: "sparkle", motion: "spin", emote: "sparkle" },
    { at: 3500, pose: null },
  ],
  daydream: [
    { at: 0, look: "up", pose: null, motion: "tilt", emote: "dots" },
    { at: 1400, look: "up-right" },
    { at: 2800, look: null, motion: "wiggle" },
  ],
  wake: [
    { at: 0, pose: "surprised", motion: "hop", emote: "exclaim" },
    { at: 900, pose: "blink" },
    { at: 1100, pose: null },
  ],
  curious: [
    { at: 0, look: "left", motion: "tilt" },
    { at: 900, look: "right" },
    { at: 1800, look: "up-right", emote: "question" },
    { at: 2600, look: null, motion: "nod" },
  ],
  scan: SCAN_STEPS,
  // Plays while music is on: a little sway with a note floating up.
  groove: [{ at: 0, motion: "sway", emote: "music" }],
  // Long-press: it's ticklish.
  tickle: [
    { at: 0, pose: "delighted", motion: "wiggle", emote: "laugh" },
    { at: 700, motion: "wiggle" },
    { at: 1400, pose: "wink", emote: "laugh" },
    { at: 2200, pose: null },
  ],
  // Points the visitor's attention at the video button.
  nudge: [
    { at: 0, look: "down", motion: "wiggle", emote: "exclaim" },
    { at: 1700, look: null },
  ],
};

const BLINK_EVERY_MS = 4200;
const CURIOUS_AFTER_MS = 9000;
const DAYDREAM_AFTER_MS = 14500;
const SLEEP_AFTER_MS = 22000;
const ZZZ_EVERY_MS = 3200;

/**
 * Drives the mascot's gestures: named one-shot gestures plus idle behaviour
 * (blinks, looking around, daydreaming, falling asleep, waking up on touch).
 */
export function useMascotPerformer() {
  const [pose, setPose] = useState<Reaction | null>(null);
  const [look, setLook] = useState<Direction | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);
  const [emote, setEmote] = useState<Emote | null>(null);

  const gestureTimers = useRef<number[]>([]);
  const idleTimers = useRef<number[]>([]);
  const glanceTimer = useRef(0);
  const zzzTimer = useRef(0);
  const busy = useRef(false);
  const asleep = useRef(false);
  const counter = useRef(0);

  const emit = useCallback((kind: EmoteKind) => {
    counter.current += 1;
    setEmote({ kind, id: counter.current });
  }, []);

  const perform = useCallback(
    (gesture: Gesture, options?: { ifIdle?: boolean }) => {
      if (options?.ifIdle && busy.current) {
        return;
      }
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
            if (step.emote) emit(step.emote);
          }, step.at),
        );
      });
      const end = steps[steps.length - 1].at + 150;
      gestureTimers.current.push(
        window.setTimeout(() => {
          busy.current = false;
        }, end),
      );
    },
    [emit],
  );

  /** Briefly turn the head toward something (a tap, say), then go back. */
  const glance = useCallback((direction: Direction, ms = 1300) => {
    if (busy.current) {
      return;
    }
    window.clearTimeout(glanceTimer.current);
    setLook(direction);
    glanceTimer.current = window.setTimeout(() => {
      if (!busy.current) setLook(null);
    }, ms);
  }, []);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => {
      idleTimers.current.push(window.setTimeout(fn, ms));
    };

    const stopZzz = () => {
      window.clearInterval(zzzTimer.current);
      zzzTimer.current = 0;
    };

    const blinkLoop = () => {
      later(
        () => {
          if (!busy.current && !asleep.current) {
            setPose("blink");
            window.setTimeout(() => {
              if (!busy.current && !asleep.current) setPose(null);
            }, 160);
          }
          blinkLoop();
        },
        BLINK_EVERY_MS + Math.random() * 2500,
      );
    };

    const scheduleIdle = () => {
      idleTimers.current.forEach(window.clearTimeout);
      idleTimers.current = [];
      blinkLoop();
      later(() => {
        if (!busy.current) perform(Math.random() < 0.5 ? "scan" : "curious");
      }, CURIOUS_AFTER_MS);
      later(() => {
        if (!busy.current) perform("daydream");
      }, DAYDREAM_AFTER_MS);
      later(() => {
        asleep.current = true;
        setPose("sleepy");
        emit("zzz");
        stopZzz();
        zzzTimer.current = window.setInterval(() => emit("zzz"), ZZZ_EVERY_MS);
      }, SLEEP_AFTER_MS);
    };

    const onActivity = () => {
      if (asleep.current) {
        asleep.current = false;
        stopZzz();
        perform("wake");
      }
      scheduleIdle();
    };

    // Coming back to the tab: peekaboo, or a dance if they were away a while.
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
        stopZzz();
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
      stopZzz();
      window.clearTimeout(glanceTimer.current);
      idleTimers.current.forEach(window.clearTimeout);
      gestureTimers.current.forEach(window.clearTimeout);
    };
  }, [perform, emit]);

  return { pose, look, motion, emote, perform, glance };
}
