import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1, counts down
  size: number;
  hue: "amber" | "cyan";
};

const MAX_PARTICLES = 60;
const SPAWN_EVERY_PX = 6; // spawn a particle every N px of pointer travel

/**
 * Fixed full-viewport canvas that trails a few glowing particles
 * behind the cursor. Fully self-contained: one rAF loop, one
 * pointermove listener, one resize listener, all torn down on
 * unmount. No-ops on touch-primary devices and when the user
 * prefers reduced motion, so it never fights mobile scrolling
 * or burns battery for people who asked for less animation.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!isCoarsePointer && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const particles: Particle[] = [];
    let lastX = 0;
    let lastY = 0;
    let distanceSinceSpawn = 0;
    let hasPointer = false;

    function spawn(x: number, y: number) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        life: 1,
        size: Math.random() * 2.5 + 1.5,
        hue: Math.random() > 0.5 ? "amber" : "cyan",
      });
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const { clientX, clientY } = event;
      if (hasPointer) {
        distanceSinceSpawn += Math.hypot(clientX - lastX, clientY - lastY);
        while (distanceSinceSpawn >= SPAWN_EVERY_PX) {
          spawn(clientX, clientY);
          distanceSinceSpawn -= SPAWN_EVERY_PX;
        }
      }
      lastX = clientX;
      lastY = clientY;
      hasPointer = true;
    }

    const amberColor = "255, 122, 51";
    const cyanColor = "79, 209, 197";

    let frameId: number;
    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const color = p.hue === "amber" ? amberColor : cyanColor;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color}, ${p.life * 0.5})`;
        ctx!.fill();
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
