import { memo, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { FileDown, Globe, Mail, MapPin, Phone, Play, UserPlus } from "lucide-react";
import IntroVideoDialog from "./IntroVideoDialog";
import Mascot from "./Mascot";
import { profile } from "../data/content";
import { useMascotPerformer } from "../hooks/useMascotPerformer";
import type { Gesture } from "../hooks/useMascotPerformer";

type IconProps = { className?: string };
type CardLink = {
  icon: ComponentType<IconProps>;
  label: string;
  href: string;
  external?: boolean;
  download?: string;
  gesture: Gesture;
};

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.2-1.8-1-.8.6a3.5 3.5 0 0 1-1.6-1.6l.6-.8-1-1.8z" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

const links: CardLink[] = [
  { icon: Phone, label: "Call", href: profile.phoneHref, gesture: "cheer" },
  { icon: Mail, label: "Email", href: `mailto:${profile.email}`, gesture: "wink" },
  { icon: WhatsAppIcon, label: "WhatsApp", href: profile.whatsappUrl, external: true, gesture: "wow" },
  { icon: LinkedInIcon, label: "LinkedIn", href: profile.linkedinUrl, external: true, gesture: "cheer" },
  { icon: GitHubIcon, label: "GitHub", href: profile.githubUrl, external: true, gesture: "geek" },
  { icon: InstagramIcon, label: "Instagram", href: profile.instagramUrl, external: true, gesture: "love" },
  { icon: Globe, label: "Portfolio", href: profile.siteUrl, external: true, gesture: "wow" },
  {
    icon: FileDown,
    label: "Resume",
    href: "/Vannsh-Shah-Resume.pdf",
    download: "Vannsh-Shah-Resume.pdf",
    gesture: "sparkle",
  },
];

function greetingWord() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const buttonClass =
  "group flex min-h-[56px] items-center gap-3 rounded-xl border border-line bg-amber/[0.03] px-4 font-mono text-sm text-ink transition-colors hover:border-amber/60 hover:bg-amber/10 active:bg-amber/15";

function CardPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [bubble, setBubble] = useState<"hi" | "thanks" | "early" | null>("hi");
  const [hello] = useState(greetingWord);
  const { pose, look, motion, perform } = useMascotPerformer();

  // On arrival the mascot says hi, winks, then glances down toward the video button.
  useEffect(() => {
    perform("greet");
  }, [perform]);

  const closeVideo = (finished: boolean) => {
    setVideoOpen(false);
    setBubble(finished ? "thanks" : "early");
    perform(finished ? "celebrate" : "shrug");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-void px-4 py-6 text-ink">
      <main className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-[0_0_40px_rgba(255,122,51,0.08)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--c-amber) 1px, transparent 1px), linear-gradient(90deg, var(--c-amber) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-mute">
            <span>Tap to connect</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          </div>

          <header className="mt-4 flex items-center gap-4">
            <div className="rounded-full border border-amber/30 bg-panel2/80 p-1 shadow-[0_0_20px_rgba(255,122,51,0.2)]">
              <Mascot
                directions="/mascots/vannsh-directions.webp"
                reactions="/mascots/vannsh-reactions.webp"
                size={92}
                label="Vannsh chibi mascot"
                pose={pose}
                look={look}
                motion={motion}
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-extrabold uppercase tracking-tight">
                {profile.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-amber">{profile.role}</p>
              <p className="mt-1 font-mono text-[11px] leading-snug text-mute">{profile.tagline}</p>
            </div>
          </header>

          {bubble && (
            <p
              role="status"
              className="relative mt-4 rounded-xl border border-amber/40 bg-panel px-3 py-2 font-mono text-xs leading-snug text-ink shadow-[0_0_14px_rgba(255,122,51,0.2)]"
            >
              <span
                aria-hidden="true"
                className="absolute -top-1.5 left-12 h-3 w-3 rotate-45 border-l border-t border-amber/40 bg-panel"
              />
              {bubble === "hi" && (
                <>
                  {hello}! 👋 I'm Vannsh. Tap <strong className="text-amber">Watch my intro</strong> to hear my story.
                </>
              )}
              {bubble === "early" && <>No worries! 😊 You can watch my intro anytime.</>}
              {bubble === "thanks" && (
                <>
                  Thanks for watching! 😊 Tap <strong className="text-amber">Save Contact</strong> to keep my number.
                </>
              )}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setBubble(null);
              setVideoOpen(true);
            }}
            className={`${bubble === "hi" ? "mt-3 ring-2 ring-amber/40" : bubble ? "mt-3" : "mt-5"} flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-amber/50 bg-amber/10 px-4 font-mono text-sm text-ink transition-colors hover:border-amber hover:bg-amber/15`}
          >
            <Play size={16} className="text-amber" aria-hidden="true" />
            Watch my intro
          </button>

          <a
            href="/contact.vcf"
            download="Vannsh-Shah.vcf"
            onClick={() => perform("celebrate")}
            className="mt-3 flex min-h-[60px] items-center justify-center gap-2 rounded-xl bg-amber px-4 font-mono text-sm font-semibold uppercase tracking-widest text-void transition-opacity hover:opacity-90 active:opacity-80"
          >
            <UserPlus size={18} aria-hidden="true" />
            Save Contact
          </a>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {links.map(({ icon: Icon, label, href, external, download, gesture }) => (
              <a
                key={label}
                href={href}
                download={download}
                onClick={() => perform(gesture)}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={buttonClass}
              >
                <Icon className="h-5 w-5 shrink-0 text-amber" />
                {label}
              </a>
            ))}
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
            <MapPin size={11} aria-hidden="true" />
            {profile.location}
          </p>
        </div>
      </main>
      {videoOpen && (
        <IntroVideoDialog onClose={() => closeVideo(false)} onEnded={() => closeVideo(true)} />
      )}
    </div>
  );
}

export default memo(CardPage);
