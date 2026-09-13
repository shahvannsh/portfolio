import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Magnet from "./Magnet";
import { profile, stats } from "../data/content";
import avatar from "../assets/avatar.webp";

const words = [
  "Building intelligent apps.",
  "Shipping AI-first products.",
  "Studying CS at DES Pune University.",
  "Currently deployed: Chotu AI Assistant.",
];

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const speed = deleting ? 28 : 45;
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, display.length + 1);
        setDisplay(next);
        if (next === current) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = current.slice(0, display.length - 1);
        setDisplay(next);
        if (next === "") {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [display, deleting, wordIndex]);

  return (
    <section
      id="top"
      className="hud-grid relative flex min-h-[92vh] flex-col justify-between overflow-hidden px-6 pb-10 pt-6 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,122,51,0.10),transparent_60%)]" />

      <div className="relative z-10 mt-10 flex flex-col items-start gap-6 md:mt-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan"
          >
            <span className="h-px w-10 bg-cyan/60" />
            {profile.role} {"\u2014"} {profile.tagline}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-display text-[13vw] font-extrabold uppercase leading-[0.95] tracking-tight md:text-[5.2rem]"
          >
            Vannsh
            <br />
            <span className="grad-text">Shah</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 min-h-[1.6em] font-mono text-sm text-amber-soft md:text-base"
          >
            &gt; {display}
            <span className="animate-pulse">_</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="/Vannsh-Shah-Resume.pdf"
              download="Vannsh-Shah-Resume.pdf"
              className="rounded-full border border-amber/50 bg-amber/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber-soft transition-colors hover:bg-amber/20"
            >
              Download Resume
            </a>
            <a
              href="#projects"
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              View Projects
            </a>
          </motion.div>
        </div>

        <Magnet padding={90} strength={5} className="shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="relative flex h-40 w-40 items-center justify-center md:h-52 md:w-52"
          >
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full border border-dashed border-amber/40" />
            <div className="absolute inset-3 rounded-full border border-cyan/30" />
            <div className="flex h-[85%] w-[85%] items-center justify-center overflow-hidden rounded-full border border-amber/50 shadow-[0_0_40px_rgba(255,122,51,0.25)]">
              <img
                src={avatar}
                alt="Vannsh Shah"
                className="h-full w-full object-cover grayscale-[15%] contrast-[1.05]"
              />
            </div>
          </motion.div>
        </Magnet>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-line pt-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
          >
            <div className="font-display text-2xl font-bold text-ink md:text-3xl">{s.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default memo(Hero);
