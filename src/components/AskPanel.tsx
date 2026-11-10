import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Send, X } from "lucide-react";
import Mascot from "./Mascot";
import type { Reaction } from "./Mascot";
import { ask, STARTER_QUESTIONS, WELCOME } from "../lib/ask";
import type { Link } from "../data/knowledge";
import { useDialog } from "../hooks/useDialog";

type Message = { id: number; from: "user" | "bot"; text: string; links?: Link[] };

const chip =
  "shrink-0 whitespace-nowrap rounded-full border border-amber/40 bg-amber/5 px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-amber hover:bg-amber/15";

/** A small Q&A chat that answers only from the portfolio and resume. */
function AskPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: WELCOME }]);
  const [chips, setChips] = useState<string[]>(STARTER_QUESTIONS);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pose, setPose] = useState<Reaction | null>(null);

  const inputRef = useDialog<HTMLInputElement>(true, onClose);
  const listRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  const send = (raw: string) => {
    const question = raw.trim();
    if (!question || thinking) {
      return;
    }
    nextId.current += 1;
    setMessages((prev) => [...prev, { id: nextId.current, from: "user", text: question }]);
    setInput("");
    setThinking(true);

    const delay = 350 + Math.min(500, question.length * 8);
    timers.current.push(
      window.setTimeout(() => {
        const answer = ask(question);
        nextId.current += 1;
        setMessages((prev) => [
          ...prev,
          { id: nextId.current, from: "bot", text: answer.text, links: answer.links },
        ]);
        setChips(answer.suggestions);
        setThinking(false);
        setPose(answer.known ? "delighted" : "bashful");
        timers.current.push(window.setTimeout(() => setPose(null), 1500));
      }, delay),
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return (
    <div
      role="dialog"
      aria-label="Chat with Vannsh's mascot"
      className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(560px,82dvh)] flex-col overflow-hidden rounded-2xl border border-amber/40 bg-panel shadow-[0_0_40px_rgba(255,122,51,0.25)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[380px]"
    >
      <header className="flex items-center gap-3 border-b border-line bg-panel2/80 px-3 py-2.5">
        <div className="rounded-full border border-amber/30 bg-panel p-0.5">
          <Mascot
            directions="/mascots/vannsh-directions.webp"
            reactions="/mascots/vannsh-reactions.webp"
            size={44}
            label="Vannsh chibi mascot"
            pose={pose}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">Ask Vannsh</p>
          <p className="truncate font-mono text-[10px] text-mute">Automated · answers only from my portfolio & resume</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full border border-amber/40 p-1.5 text-ink transition-colors hover:border-amber hover:text-amber"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </header>

      <div ref={listRef} role="log" aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        {messages.map((m) => (
          <div key={m.id} className={m.from === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
            <p
              className={
                m.from === "user"
                  ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-amber px-3 py-2 font-body text-sm text-void"
                  : "max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-line bg-panel2 px-3 py-2 font-body text-sm leading-relaxed text-ink"
              }
            >
              {m.text}
            </p>
            {m.links && m.links.length > 0 && (
              <div className="mt-2 flex max-w-[90%] flex-wrap gap-1.5">
                {m.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    download={link.download}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="rounded-full border border-amber/50 px-2.5 py-1 font-mono text-[11px] text-amber transition-colors hover:bg-amber/15"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <p role="status" aria-label="Typing" className="self-start rounded-2xl rounded-bl-sm border border-line bg-panel2 px-3 py-2 font-mono text-sm text-mute motion-safe:animate-pulse">
            …
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-2">
        {chips.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} disabled={thinking} className={chip}>
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={200}
          aria-label="Ask a question"
          placeholder="Ask about my career, projects, skills…"
          className="min-w-0 flex-1 rounded-full border border-line bg-panel2 px-4 py-2 font-body text-sm text-ink outline-none placeholder:text-mute focus:border-amber"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          aria-label="Send question"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-void transition-opacity disabled:opacity-40"
        >
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default AskPanel;
