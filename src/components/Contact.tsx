import { memo, useState } from "react";
import type { FormEvent } from "react";
import { Code, Link as LinkIcon, Mail, Phone, MapPin, FileDown } from "lucide-react";
import FadeIn from "./FadeIn";
import { profile } from "../data/content";

type FormStatus = "idle" | "submitting" | "sent" | "error";

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
        <FadeIn
          delay={0.1}
          x={-15}
          y={0}
          className="overflow-hidden rounded-2xl border border-line bg-panel"
        >
          <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-amber/70" />
            <span className="h-3 w-3 rounded-full bg-cyan/70" />
            <span className="h-3 w-3 rounded-full bg-mute/50" />
            <span className="ml-3 font-mono text-xs text-mute">vannsh@portfolio: ~/contact</span>
          </div>
          <div className="space-y-4 p-6 font-mono text-sm md:p-8">
            <ContactLine
              icon={<Mail size={16} />}
              label="email"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
            <ContactLine icon={<Phone size={16} />} label="phone" value={profile.phone} />
            <ContactLine
              icon={<LinkIcon size={16} />}
              label="linkedin"
              value={profile.linkedin}
              href={profile.linkedinUrl}
            />
            <ContactLine
              icon={<Code size={16} />}
              label="github"
              value={profile.github}
              href={profile.githubUrl}
            />
            <ContactLine icon={<MapPin size={16} />} label="location" value={profile.location} />
            <ContactLine
              icon={<FileDown size={16} />}
              label="resume"
              value="Vannsh-Shah-Resume.pdf"
              href="/Vannsh-Shah-Resume.pdf"
              download
            />
          </div>
        </FadeIn>

        <FadeIn
          delay={0.2}
          x={15}
          y={0}
          className="overflow-hidden rounded-2xl border border-line bg-panel"
        >
          <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-amber/70" />
            <span className="h-3 w-3 rounded-full bg-cyan/70" />
            <span className="h-3 w-3 rounded-full bg-mute/50" />
            <span className="ml-3 font-mono text-xs text-mute">
              vannsh@portfolio: ~/send-message
            </span>
          </div>

          {status === "sent" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
              <span className="font-mono text-sm text-cyan">Message sent {"\u2014"} thanks!</span>
              <span className="font-mono text-xs text-mute">I'll get back to you soon.</span>
            </div>
          ) : (
            <form
              action={`https://formsubmit.co/${profile.email}`}
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-4 p-6 md:p-8"
            >
              <input type="hidden" name="_subject" value="New message from portfolio" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="text" name="_honey" style={{ display: "none" }} />

              <Field name="name" label="name" placeholder="Your name" required />
              <Field
                name="email"
                label="email"
                type="email"
                placeholder="your@email.com"
                required
              />
              <Field name="subject" label="subject" placeholder="What's this about?" />
              <TextAreaField name="message" label="message" placeholder="Say hello..." required />

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
                className="w-full rounded-lg border border-amber/50 bg-amber/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber-soft transition-colors hover:bg-amber/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
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
        className="w-full rounded-lg border border-line bg-panel2 px-4 py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-cyan/50"
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
        className="w-full resize-y rounded-lg border border-line bg-panel2 px-4 py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-cyan/50"
      />
    </label>
  );
}

function ContactLine({
  icon,
  label,
  value,
  href,
  download,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  download?: boolean;
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
        download ? (
          <a href={href} download>
            {content}
          </a>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        )
      ) : (
        content
      )}
    </div>
  );
}

export default memo(Contact);
