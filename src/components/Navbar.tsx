import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-6 py-5 md:px-10"
      >
        <a href="#top" className="font-display text-lg font-extrabold tracking-wider">
          <span className="grad-text">VS</span>
          <span className="ml-1 text-mute">/// </span>
        </a>
        <ul className="hidden gap-8 md:flex md:items-center">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-xs uppercase tracking-[0.2em] text-mute transition-colors hover:text-amber"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button className="text-ink" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-void/98 backdrop-blur-xl">
          <button
            className="absolute right-6 top-6 text-amber"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={26} />
          </button>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-2xl uppercase tracking-widest text-ink hover:text-amber"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
