import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useDialog } from "../hooks/useDialog";

type EasterEggOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

export default function EasterEggOverlay({ open, onClose, title, message }: EasterEggOverlayProps) {
  const closeButtonRef = useDialog<HTMLButtonElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-void/90 backdrop-blur-md px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md rounded-lg border border-line bg-panel p-8 text-center shadow-[0_0_40px_rgba(255,122,51,0.15)]"
          >
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 text-mute transition-colors hover:text-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              <X size={20} />
            </button>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Access Granted</p>
            <h2 id="easter-egg-title" className="mt-3 font-display text-2xl font-bold">
              <span className="grad-text">{title}</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mute">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
