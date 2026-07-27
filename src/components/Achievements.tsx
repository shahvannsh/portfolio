import FadeIn from "./FadeIn";
import { achievements } from "../data/content";

export default function Achievements() {
  return (
    <section className="bg-panel2 px-6 py-20 md:px-10 md:py-24">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Field Notes
        </div>
        <h2 className="mb-12 font-display text-3xl font-extrabold uppercase tracking-tight md:text-5xl">
          Workshops {"\u0026"} <span className="grad-text">Expos</span>
        </h2>
      </FadeIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <FadeIn key={a.title} delay={i * 0.06} className="rounded-2xl border border-line bg-panel p-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-soft">
              {a.date}
            </div>
            <h3 className="mb-1 font-display text-base font-bold text-ink">{a.title}</h3>
            <div className="mb-3 text-xs text-mute">{a.org}</div>
            <p className="text-sm leading-relaxed text-ink/80">{a.note}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
