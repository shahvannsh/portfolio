import FadeIn from "./FadeIn";
import AnimatedText from "./AnimatedText";
import { passions, spokenLanguages } from "../data/content";

export default function About() {
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

      <AnimatedText
        className="max-w-3xl font-body text-xl leading-relaxed text-ink md:text-2xl"
        text="Aspiring Computer Science Engineer and tech & sustainability enthusiast. I'm a third-year CSE student building AI-first products with a strong C++/Python foundation. Currently an AI-ML Intern at Nova Techset, holder of 16 completed AI/ML certifications across AWS, Google Cloud and OpenAI, and the builder behind Chotu, an Iron-Man-inspired study assistant, and CareerConnecting, a swipe-based job matching app."
      />

      <FadeIn delay={0.15} className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-amber-soft">
            Passions
          </h3>
          <div className="flex flex-wrap gap-2">
            {passions.map((p) => (
              <span
                key={p}
                className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink/85"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {spokenLanguages.map((l) => (
              <span
                key={l}
                className="rounded-full border border-line bg-panel2 px-3 py-1.5 text-xs text-ink/85"
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
    </section>
  );
}
