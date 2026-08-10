import { memo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink } from "lucide-react";
import FadeIn from "./FadeIn";
import { projects } from "../data/content";
import chotuScreenshot from "../assets/chotu-screenshot.webp";

function Visual({ type }: { type: "swipe" | "screenshot" | "grid" }) {
  if (type === "screenshot") {
    return (
      <div className="h-full w-full overflow-hidden rounded-2xl border border-line">
        <img
          src={chotuScreenshot}
          alt="Chotu AI assistant dashboard"
          className="h-full w-full object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  if (type === "swipe") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`absolute h-28 w-44 rounded-xl border ${
              i === 2 ? "border-amber/60 bg-amber/10" : "border-mute/15 bg-panel"
            }`}
            style={{
              transform: `rotate(${(i - 1) * 8}deg) translateY(${i * 6}px)`,
              zIndex: i,
            }}
          />
        ))}
        <span className="relative z-10 mt-24 font-mono text-[10px] uppercase tracking-widest text-amber-soft">
          Swipe {"\u2192"}
        </span>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-5 grid-rows-4 gap-1.5 overflow-hidden rounded-2xl border border-line bg-panel2 p-3">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-sm border border-void ${
            i % 7 === 0 ? "bg-amber/40" : i % 5 === 0 ? "bg-cyan/30" : "bg-panel"
          }`}
        />
      ))}
    </div>
  );
}

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
    <div
      ref={ref}
      className="sticky top-20 h-[76vh] md:top-28"
      style={{ top: `${80 + index * 24}px` }}
    >
      <motion.div
        style={{ scale }}
        className="h-full w-full rounded-[32px] border-2 border-line bg-panel p-6 shadow-2xl md:p-10"
      >
        <div className="grid h-full grid-rows-[auto_1fr] gap-6 md:grid-cols-[1.2fr_1fr] md:grid-rows-1">
          <div className="flex flex-col justify-between">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-extrabold text-amber-ghost md:text-6xl">
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
              <div className="flex flex-wrap items-center gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-amber/30 bg-amber/5 px-3 py-1 font-mono text-xs text-amber-soft"
                  >
                    {s}
                  </span>
                ))}
                {"liveUrl" in project && project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/5 px-3 py-1 font-mono text-xs text-cyan transition-colors hover:bg-cyan/15"
                  >
                    View Live
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-[140px]">
            <Visual type={project.visual} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Projects() {
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

      <div className="mx-auto max-w-5xl">
        {projects.map((p, i) => (
          <Card key={p.id} project={p} index={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
}

export default memo(Projects);
