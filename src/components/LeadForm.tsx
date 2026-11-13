import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { profile } from "../data/content";
import { useDialog } from "../hooks/useDialog";
import { track } from "../lib/analytics";

type Status = "idle" | "sending" | "sent" | "failed";

const field =
  "w-full rounded-xl border border-line bg-panel2 px-3 py-2.5 font-body text-sm text-ink outline-none placeholder:text-mute focus:border-amber";

/** "Leave your details": a short form that reaches Vannsh by email (via /api/lead), with a fallback to email/WhatsApp. */
function LeadForm({ onClose, onSent }: { onClose: () => void; onSent?: () => void }) {
  const firstRef = useDialog<HTMLInputElement>(true, onClose);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const openedAt = useRef(Date.now());

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(
    `Hi Vannsh,\n\nI'm ${name || "…"} (${email || "…"}).\n\n${message}`,
  )}`;
  const whatsapp = `${profile.whatsappUrl}?text=${encodeURIComponent(`Hi Vannsh, I'm ${name || "…"}. ${message}`.trim())}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") {
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company: trap, elapsed: Date.now() - openedAt.current }),
      });
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      track("lead_sent");
      setStatus("sent");
      onSent?.();
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leave your details"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-amber/40 bg-panel p-5 shadow-[0_0_40px_rgba(255,122,51,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className="absolute right-2 top-2 rounded-full border border-amber/40 p-1.5 text-ink transition-colors hover:border-amber hover:text-amber"
        >
          <X size={14} aria-hidden="true" />
        </button>
        <p className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">Leave your details</p>
        <p className="mt-1 font-mono text-[11px] text-mute">I'll get back to you. Your details go only to me.</p>

        {status === "sent" ? (
          <p role="status" className="mt-5 rounded-xl border border-amber/40 bg-amber/10 p-4 font-body text-sm text-ink">
            Thanks{name ? `, ${name}` : ""}! I got your message and will reply soon. 🙌
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <input
              ref={firstRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              autoComplete="name"
              aria-label="Your name"
              placeholder="Your name"
              className={field}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              maxLength={120}
              autoComplete="email"
              aria-label="Your email"
              placeholder="Your email"
              className={field}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              aria-label="Message (optional)"
              placeholder="Message (optional): role, company, what you'd like to discuss"
              className={field}
            />
            {/* Honeypot: real visitors never see or fill this. */}
            <input
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              name="company"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="min-h-[48px] rounded-xl bg-amber px-4 font-mono text-sm font-semibold uppercase tracking-widest text-void transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            {status === "failed" && (
              <p role="alert" className="font-body text-xs text-ink">
                That didn't go through. You can{" "}
                <a href={mailto} className="text-amber underline">
                  email me
                </a>{" "}
                or{" "}
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-amber underline">
                  message me on WhatsApp
                </a>{" "}
                instead.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default LeadForm;
