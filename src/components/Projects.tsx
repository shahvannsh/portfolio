import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "./FadeIn";
import { projects } from "../data/content";

function Card({
  project,
  index,
  total,
}: {
  project: (typeof projects)[number];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const targetScale = 1 - (total - 1 - index) * 0.04;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={ref} className="sticky top-20 h-[70vh] md:top-28" style={{ top: `${80 + index * 24}px` }}>
      <motion.div
        style={{ scale }}
        className="h-full w-full rounded-[32px] border-2 border-line bg-panel p-6 shadow-2xl md:p-10"
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-4xl font-extrabold text-amber/40 md:text-6xl">
                {project.id}
              </span>
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
                  {project.category}
                </div>
                <h3 className="font-display text-2xl font-bold uppercase text-ink md:text-4xl">
                  {project.name}
                </h3>
                <div className="text-sm text-mute">{project.sub}</div>
              </div>
            </div>
            <span className="rounded-full border border-line px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-mute">
              {project.period}
            </span>
          </div>

          <div>
            <p className="mb-5 max-w-2xl text-base leading-relaxed text-ink/85 md:text-lg">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-amber/30 bg-amber/5 px-3 py-1 font-mono text-xs text-amber-soft"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="bg-panel2 px-6 pb-24 pt-24 md:px-10 md:pb-40 md:pt-32">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Mission Logs
        </div>
        <h2 className="mb-16 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          Featured <span className="grad-text">Builds</span>
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-4xl">
        {projects.map((p, i) => (
          <Card key={p.id} project={p} index={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
}
