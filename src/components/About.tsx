import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe, MapPin, Cpu, Radio, Users } from "lucide-react";
import FadeIn from "./FadeIn";
import AnimatedText from "./AnimatedText";
import { profile, passions, spokenLanguages, stats } from "../data/content";

const statusRows = [
  { icon: Cpu, label: "Role", value: profile.role },
  { icon: Users, label: "Position", value: profile.position },
  { icon: MapPin, label: "Location", value: profile.location },
  { icon: Radio, label: "Building", value: "Chotu — AI study assistant" },
];

const certStat = stats.find((s) => s.label === "Certifications");
const projectStat = stats.find((s) => s.label === "Projects Shipped");

function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Profile
        </div>
        <h2 className="mb-10 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          About <span className="grad-text">Me</span>
        </h2>
      </FadeIn>

      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14">
        <div>
          <AnimatedText
            className="max-w-2xl font-body text-xl leading-relaxed text-ink md:text-2xl"
            text="Third-year Computer Science Engineering student with a strong foundation in C++ and Python, focused on AI/ML and full-stack development. I completed an AI-ML internship at Nova Techset, working hands-on with applied machine learning in a production environment. Outside of that, I build things I actually use — Chotu, an Iron-Man-inspired study assistant, and CareerConnecting, a swipe-based job-matching app — and hold 16 completed certifications across AWS, Google Cloud, and OpenAI. Also a tech & sustainability enthusiast."
          />

          <FadeIn delay={0.15} className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-amber-soft">
                <Sparkles size={13} />
                Passions
              </h3>
              <div className="flex flex-wrap gap-2">
                {passions.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink/85 transition-colors hover:border-amber/50 hover:text-amber-soft"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-cyan">
                <Globe size={13} />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {spokenLanguages.map((l) => (
                  <span
                    key={l}
                    className="rounded-full border border-line bg-panel2 px-3 py-1.5 text-xs text-ink/85 transition-colors hover:border-cyan/50 hover:text-cyan"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.25} className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-full border border-amber/50 bg-amber/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber-soft transition-colors hover:bg-amber/20"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              Get In Touch
            </a>
          </FadeIn>
        </div>

        <FadeIn x={15} y={0} delay={0.1}>
          <div className="relative overflow-hidden rounded-lg border border-line bg-panel p-6 shadow-[0_0_40px_rgba(255,122,51,0.08)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--c-amber) 1px, transparent 1px), linear-gradient(90deg, var(--c-amber) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative mb-5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mute">
                System Profile
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-cyan"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Online
              </span>
            </div>

            <div className="relative space-y-4">
              {statusRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <row.icon size={15} className="mt-0.5 shrink-0 text-amber" />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                      {row.label}
                    </div>
                    <div className="mt-0.5 text-sm text-ink">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-5 border-t border-line pt-4 font-mono text-[11px] text-mute">
              <span className="text-amber">{certStat?.value ?? "16"}</span>{" "}
              {(certStat?.label ?? "Certifications").toLowerCase()} {"\u00b7"}{" "}
              <span className="text-cyan">{projectStat?.value ?? "07"}</span>{" "}
              {(projectStat?.label ?? "Projects Shipped").toLowerCase()}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default memo(About);
