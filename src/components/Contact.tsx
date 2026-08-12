import { memo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { Code, Link as LinkIcon, Mail, Phone, MapPin, FileDown, Send } from "lucide-react";
import FadeIn from "./FadeIn";
import { profile } from "../data/content";

type FormStatus = "idle" | "submitting" | "sent" | "error";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: profile.phone,
  },
  {
    icon: LinkIcon,
    label: "LinkedIn",
    value: profile.linkedin,
    href: profile.linkedinUrl,
  },
  {
    icon: Code,
    label: "GitHub",
    value: profile.github,
    href: profile.githubUrl,
  },
  {
    icon: MapPin,
    label: "Location",
    value: profile.location,
  },
  {
    icon: FileDown,
    label: "Resume",
    value: "Vannsh-Shah-Resume.pdf",
    href: "/Vannsh-Shah-Resume.pdf",
    download: true,
  },
];

function GridGlowCard({ children, glow = "amber" }: { children: ReactNode; glow?: "amber" | "cyan" }) {
  const shadow =
    glow === "amber"
      ? "shadow-[0_0_40px_rgba(255,122,51,0.08)]"
      : "shadow-[0_0_40px_rgba(79,209,197,0.08)]";
  return (
    <div className={`relative overflow-hidden rounded-lg border border-line bg-panel p-6 md:p-8 ${shadow}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--c-amber) 1px, transparent 1px), linear-gradient(90deg, var(--c-amber) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

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

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <FadeIn delay={0.1} x={-15} y={0}>
          <GridGlowCard glow="amber">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mute">
                Reach Me
              </span>
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-amber"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="space-y-1">
              {contactMethods.map((method) => (
                <ContactRow key={method.label} {...method} />
              ))}
            </div>
          </GridGlowCard>
        </FadeIn>

        <FadeIn delay={0.2} x={15} y={0}>
          <GridGlowCard glow="cyan">
            {status === "sent" ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 text-center">
                <span className="font-mono text-sm text-cyan">Message sent {"\u2014"} thanks!</span>
                <span className="font-mono text-xs text-mute">I'll get back to you soon.</span>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mute">
                    Send a Message
                  </span>
                </div>
                <form
                  action={`https://formsubmit.co/${profile.email}`}
                  method="POST"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <input type="hidden" name="_subject" value="New message from portfolio" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />
                  <input type="text" name="_honey" style={{ display: "none" }} />

                  <Field name="name" label="Name" placeholder="Your name" required />
                  <Field
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  <Field name="subject" label="Subject" placeholder="What's this about?" />
                  <TextAreaField name="message" label="Message" placeholder="Say hello..." required />

                  {status === "error" && (
                    <p role="alert" className="font-mono text-xs text-amber">
                      Something went wrong sending that. Try again, or email me directly at{" "}
                      <a href={`mailto:${profile.email}`} className="underline">
                        {profile.email}
                      </a>
                      .
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber px-6 py-3 font-mono text-xs uppercase tracking-widest text-void transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      "Sending…"
                    ) : (
                      <>
                        Send Message
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </GridGlowCard>
        </FadeIn>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-mute">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-line bg-panel2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-cyan/50"
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-mute">
        {label}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full resize-y rounded-lg border border-line bg-panel2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-cyan/50"
      />
    </label>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  download,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  download?: boolean;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/5 text-amber transition-colors group-hover:border-amber/60 group-hover:bg-amber/15">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
          {label}
        </span>
        <span className="block truncate text-sm text-ink transition-colors group-hover:text-amber-soft">
          {value}
        </span>
      </span>
    </>
  );

  const rowClass = "group flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-panel2/60";

  if (!href) {
    return <div className={rowClass}>{inner}</div>;
  }

  return download ? (
    <a href={href} download className={rowClass}>
      {inner}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
      {inner}
    </a>
  );
}

export default memo(Contact);
