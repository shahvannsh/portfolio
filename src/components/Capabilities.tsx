import { memo } from "react";
import FadeIn from "./FadeIn";
import { capabilities, certifications } from "../data/content";

const skillGroups = [
  { label: "Languages", items: capabilities.languages },
  { label: "Databases", items: capabilities.databases },
  { label: "AI / Data", items: capabilities.aiData },
  { label: "Frameworks", items: capabilities.frameworks },
  { label: "Tools", items: capabilities.tools },
  { label: "Competitive Coding", items: capabilities.competitive },
];

function Capabilities() {
  return (
    <section id="capabilities" className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Systems Loaded
        </div>
        <h2 className="mb-14 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          Capabilities
        </h2>
      </FadeIn>

      <div className="grid gap-14 md:grid-cols-2">
        <FadeIn x={-15} y={0}>
          <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-amber-soft">
            Skill Stack
          </h3>
          <div className="space-y-6">
            {skillGroups.map((g) => (
              <div key={g.label}>
                <div className="mb-2 text-sm text-mute">{g.label}</div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink/90"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn x={15} y={0} delay={0.1}>
          <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Certification Registry {"\u2014"} 16 Completed
          </h3>
          <div className="space-y-5">
            {certifications.map((c) => (
              <div key={c.group} className="border-l-2 border-line pl-4">
                <div className="mb-1.5 text-sm font-semibold text-ink">{c.group}</div>
                <ul className="space-y-1">
                  {c.items.map((item) => (
                    <li key={item} className="text-xs leading-relaxed text-mute md:text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default memo(Capabilities);
