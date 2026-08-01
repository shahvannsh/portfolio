import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  Download,
  Code,
  Link as LinkIcon,
  Mail,
  Sun,
  Moon,
  Hash,
} from "lucide-react";
import { profile } from "../data/content";
import { useTheme, toggleTheme } from "../hooks/useTheme";

type Command = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  action: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

function downloadResume() {
  const link = document.createElement("a");
  link.href = "/Vannsh-Shah-Resume.pdf";
  link.download = "Vannsh-Shah-Resume.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
  } catch {
    // Clipboard API can fail without permissions/HTTPS in some contexts;
    // the palette still closes cleanly, nothing else depends on this.
  }
}

const SECTIONS = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const commands: Command[] = useMemo(
    () => [
      ...SECTIONS.map((s) => ({
        id: `goto-${s.href}`,
        label: `Go to ${s.label}`,
        keywords: "navigate section jump",
        icon: <Hash size={15} />,
        action: () => {
          window.location.hash = s.href;
        },
      })),
      {
        id: "resume",
        label: "Download resume",
        hint: "PDF",
        keywords: "cv pdf download",
        icon: <Download size={15} />,
        action: downloadResume,
      },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        keywords: "dark light mode appearance",
        icon: theme === "dark" ? <Sun size={15} /> : <Moon size={15} />,
        action: toggleTheme,
      },
      {
        id: "email",
        label: "Copy email address",
        hint: profile.email,
        keywords: "contact mail",
        icon: <Mail size={15} />,
        action: copyEmail,
      },
      {
        id: "github",
        label: "Open GitHub profile",
        hint: profile.github,
        keywords: "code repos projects",
        icon: <Code size={15} />,
        action: () => window.open(profile.githubUrl, "_blank", "noopener,noreferrer"),
      },
      {
        id: "linkedin",
        label: "Open LinkedIn profile",
        hint: profile.linkedin,
        keywords: "connect network",
        icon: <LinkIcon size={15} />,
        action: () => window.open(profile.linkedinUrl, "_blank", "noopener,noreferrer"),
      },
    ],
    [theme],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setQuery("");
      // Wait a tick so the element exists post-animation-mount.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      previouslyFocused.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const cmd = filtered[activeIndex];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, activeIndex, onClose]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-void/80 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-panel shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search size={16} className="text-mute" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actions…"
                aria-label="Search commands"
                className="w-full bg-transparent font-mono text-sm text-ink placeholder:text-mute focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mute">
                ESC
              </kbd>
            </div>
            <div ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-mute">No matching actions.</p>
              )}
              {filtered.map((cmd, index) => (
                <button
                  key={cmd.id}
                  data-index={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    index === activeIndex ? "bg-panel2 text-ink" : "text-mute hover:bg-panel2"
                  }`}
                >
                  <span className="text-amber">{cmd.icon}</span>
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.hint && (
                    <span className="truncate text-xs text-mute max-w-[40%]">{cmd.hint}</span>
                  )}
                  {index === activeIndex && <ArrowRight size={14} className="text-amber" />}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
