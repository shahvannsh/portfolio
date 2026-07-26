import FadeIn from "./FadeIn";
import { journey } from "../data/content";

export default function Journey() {
  return (
    <section id="journey" className="bg-panel2 px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Experience Log
        </div>
        <h2 className="mb-14 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          The <span className="grad-text">Journey</span>
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-3xl border-l border-line pl-8">
        {journey.map((entry, i) => (
          <FadeIn key={entry.tag} delay={i * 0.08} x={-20} y={0} className="relative mb-12 last:mb-0">
            <span className="absolute -left-[38px] top-1 h-3 w-3 rounded-full border-2 border-amber bg-void" />
            <div className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-amber-soft">
              {entry.tag} {"\u00b7"} {entry.date}
            </div>
            <h3 className="font-display text-lg font-bold text-ink md:text-xl">{entry.title}</h3>
            <div className="mb-3 text-sm text-mute">
              {entry.org} {entry.meta && <span className="text-mute/70">{"\u2014"} {entry.meta}</span>}
            </div>
            <ul className="space-y-1.5">
              {entry.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm leading-relaxed text-ink/85 md:text-base">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                  {p}
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
