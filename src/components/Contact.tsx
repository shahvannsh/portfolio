import { Code, Link as LinkIcon, Mail, Phone, MapPin } from "lucide-react";
import FadeIn from "./FadeIn";
import { profile } from "../data/content";

export default function Contact() {
  return (
    <section id="contact" className="px-6 py-24 md:px-10 md:py-32">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
          <span className="h-px w-10 bg-cyan/60" />
          Open Channel
        </div>
        <h2 className="mb-14 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          Let's <span className="grad-text">Connect</span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.1} className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-amber/70" />
          <span className="h-3 w-3 rounded-full bg-cyan/70" />
          <span className="h-3 w-3 rounded-full bg-mute/50" />
          <span className="ml-3 font-mono text-xs text-mute">vannsh@portfolio: ~/contact</span>
        </div>
        <div className="space-y-4 p-6 font-mono text-sm md:p-8">
          <ContactLine icon={<Mail size={16} />} label="email" value={profile.email} href={`mailto:${profile.email}`} />
          <ContactLine icon={<Phone size={16} />} label="phone" value={profile.phone} />
          <ContactLine icon={<LinkIcon size={16} />} label="linkedin" value={profile.linkedin} href={profile.linkedinUrl} />
          <ContactLine icon={<Code size={16} />} label="github" value={profile.github} href={profile.githubUrl} />
          <ContactLine icon={<MapPin size={16} />} label="location" value={profile.location} />
        </div>
      </FadeIn>
    </section>
  );
}

function ContactLine({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 text-ink/90 transition-colors group-hover:text-amber-soft">
      {icon}
      <span className="text-mute">{label}:</span>
      {value}
    </span>
  );
  return (
    <div className="group flex items-center gap-2">
      <span className="text-cyan">$</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
