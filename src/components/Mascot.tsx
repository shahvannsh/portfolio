import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const DIRECTIONS = [
  "up-left",
  "up",
  "up-right",
  "left",
  "center",
  "right",
  "down-left",
  "down",
  "down-right",
] as const;

const REACTIONS = [
  "blink",
  "heart",
  "sparkle",
  "surprised",
  "wink",
  "bashful",
  "sleepy",
  "dizzy",
  "delighted",
] as const;

export type Direction = (typeof DIRECTIONS)[number];
export type Reaction = (typeof REACTIONS)[number];

const CLOCKWISE: Direction[] = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
];
const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE = 70;

const PAYOFFS: Reaction[] = ["heart", "sparkle", "delighted"];
const BOOP_PAYOFF = 120;
const BOOP_END = 560;
const SQUASH_MS = 420;
const DIZZY_AFTER = 4;
const DIZZY_WINDOW = 1600;
const DIZZY_END = 1100;

const SQUASH: Keyframe[] = [
  { transform: "scale(1, 1)", easing: "ease-in" },
  { transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
  { transform: "scale(0.95, 1.08)", offset: 0.45, easing: "ease-in-out" },
  { transform: "scale(1.03, 0.97)", offset: 0.72, easing: "ease-in-out" },
  { transform: "scale(1, 1)" },
];

const BOB: Keyframe[] = [
  { transform: "translateY(0) rotate(0deg)" },
  { transform: "translateY(-3px) rotate(-2deg)" },
  { transform: "translateY(0) rotate(0deg)" },
  { transform: "translateY(-2px) rotate(2deg)" },
  { transform: "translateY(0) rotate(0deg)" },
];

export type Motion = {
  type: "hop" | "hop2" | "nod" | "tilt" | "shake" | "wiggle" | "sway" | "spin";
  id: number;
};

const MOTIONS: Record<Motion["type"], { frames: Keyframe[]; duration: number }> = {
  hop: {
    duration: 600,
    frames: [
      { transform: "translateY(0) scale(1, 1)" },
      { transform: "translateY(0) scale(1.08, 0.9)", offset: 0.15 },
      { transform: "translateY(-16px) scale(0.96, 1.06)", offset: 0.5 },
      { transform: "translateY(0) scale(1.05, 0.94)", offset: 0.8 },
      { transform: "translateY(0) scale(1, 1)" },
    ],
  },
  nod: {
    duration: 700,
    frames: [
      { transform: "translateY(0) rotate(0deg)" },
      { transform: "translateY(6px) rotate(2deg)", offset: 0.25 },
      { transform: "translateY(0) rotate(0deg)", offset: 0.5 },
      { transform: "translateY(5px) rotate(1deg)", offset: 0.75 },
      { transform: "translateY(0) rotate(0deg)" },
    ],
  },
  hop2: {
    duration: 1000,
    frames: [
      { transform: "translateY(0) scale(1, 1)" },
      { transform: "translateY(-14px) scale(0.97, 1.05)", offset: 0.2 },
      { transform: "translateY(0) scale(1.05, 0.94)", offset: 0.4 },
      { transform: "translateY(-18px) scale(0.96, 1.07)", offset: 0.65 },
      { transform: "translateY(0) scale(1.05, 0.94)", offset: 0.85 },
      { transform: "translateY(0) scale(1, 1)" },
    ],
  },
  shake: {
    duration: 520,
    frames: [
      { transform: "rotate(0deg)" },
      { transform: "rotate(-7deg)", offset: 0.2 },
      { transform: "rotate(7deg)", offset: 0.45 },
      { transform: "rotate(-5deg)", offset: 0.7 },
      { transform: "rotate(4deg)", offset: 0.88 },
      { transform: "rotate(0deg)" },
    ],
  },
  wiggle: {
    duration: 600,
    frames: [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.06) rotate(-4deg)", offset: 0.25 },
      { transform: "scale(1.06) rotate(4deg)", offset: 0.5 },
      { transform: "scale(1.04) rotate(-3deg)", offset: 0.75 },
      { transform: "scale(1) rotate(0deg)" },
    ],
  },
  sway: {
    duration: 1300,
    frames: [
      { transform: "translateX(0) rotate(0deg)" },
      { transform: "translateX(-9px) rotate(-5deg)", offset: 0.25 },
      { transform: "translateX(9px) rotate(5deg)", offset: 0.5 },
      { transform: "translateX(-9px) rotate(-5deg)", offset: 0.75 },
      { transform: "translateX(0) rotate(0deg)" },
    ],
  },
  spin: {
    duration: 750,
    frames: [
      { transform: "rotate(0deg) scale(1)" },
      { transform: "rotate(180deg) scale(1.08)", offset: 0.5 },
      { transform: "rotate(360deg) scale(1)" },
    ],
  },
  tilt: {
    duration: 1000,
    frames: [
      { transform: "rotate(0deg)" },
      { transform: "rotate(-9deg)", offset: 0.3 },
      { transform: "rotate(-9deg)", offset: 0.7 },
      { transform: "rotate(0deg)" },
    ],
  },
};

function cell(index: number): CSSProperties {
  return { backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` };
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

const layer: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "300% 300%",
  backgroundRepeat: "no-repeat",
};

export type MascotProps = {
  /** The 3x3 sheet of head directions. A served path, or an imported image. */
  directions: string;
  /** The 3x3 sheet of expressions. */
  reactions: string;
  size?: number;
  className?: string;
  /** What a screen reader calls it. */
  label?: string;
  /** An expression held from outside (for example while speaking). */
  pose?: Reaction | null;
  /** Bobs gently while true. */
  talking?: boolean;
  /** A head direction held from outside; wins over the cursor-following look. */
  look?: Direction | null;
  /** Plays a one-off movement each time `id` changes. */
  motion?: Motion | null;
};

export function Mascot(props: MascotProps) {
  const { directions, reactions, size = 140, className, label = "mascot", pose = null, talking = false, look = null, motion = null } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const squashRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<number[]>([]);
  const boopsRef = useRef({ count: 0, at: 0 });
  const [direction, setDirection] = useState<Direction>("center");
  const [reaction, setReaction] = useState<Reaction | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    let sector = -1;
    let pointer: { x: number; y: number } | null = null;

    const aim = () => {
      const button = buttonRef.current;
      if (!button || !pointer) {
        return;
      }

      const box = button.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        setDirection("center");
        return;
      }

      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return;
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDirection(CLOCKWISE[sector]);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      aim();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", aim);
    };
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    const el = squashRef.current;
    if (
      !talking ||
      !el ||
      typeof el.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const animation = el.animate(BOB, { duration: 900, iterations: Infinity, easing: "linear" });
    return () => animation.cancel();
  }, [talking]);

  const motionId = motion?.id;
  const motionType = motion?.type;
  useEffect(() => {
    const el = squashRef.current;
    if (
      !motionType ||
      !el ||
      typeof el.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const { frames, duration } = MOTIONS[motionType];
    el.animate(frames, { duration, easing: "ease-in-out" });
  }, [motionId, motionType]);

  const boop = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    const later = (ms: number, next: Reaction | null) => {
      timersRef.current.push(window.setTimeout(() => setReaction(next), ms));
    };

    const now = Date.now();
    const boops = boopsRef.current;
    boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1;
    boops.at = now;

    if (boops.count >= DIZZY_AFTER) {
      boops.count = 0;
      setReaction("dizzy");
      later(DIZZY_END, null);
    } else {
      setReaction("blink");
      later(BOOP_PAYOFF, PAYOFFS[(boops.count - 1) % PAYOFFS.length]);
      later(BOOP_END, null);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    squashRef.current?.animate(SQUASH, { duration: SQUASH_MS, easing: "linear" });
  };

  const shown = reaction ?? pose;
  const facing = look ?? direction;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      aria-label={`Boop the ${label}`}
      className={className}
      style={{
        position: "relative",
        display: "block",
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: "transparent",
        appearance: "none",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span
        ref={squashRef}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          transformOrigin: "50% 78%",
        }}
      >
        <span
          style={{
            ...layer,
            backgroundImage: `url(${directions})`,
            ...cell(DIRECTIONS.indexOf(facing)),
            opacity: shown ? 0 : 1,
          }}
        />
        <span
          style={{
            ...layer,
            backgroundImage: `url(${reactions})`,
            ...cell(REACTIONS.indexOf(shown ?? "blink")),
            opacity: shown ? 1 : 0,
          }}
        />
      </span>
    </button>
  );
}

export default Mascot;
