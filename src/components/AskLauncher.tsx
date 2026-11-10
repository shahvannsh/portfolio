import { useState } from "react";
import { MessageCircle } from "lucide-react";
import AskPanel from "./AskPanel";

/** Floating "Ask me" button that opens the portfolio Q&A chat. */
function AskLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-amber/50 bg-panel/90 px-4 py-2.5 font-mono text-xs text-ink shadow-[0_0_18px_rgba(255,122,51,0.25)] backdrop-blur-md transition-colors hover:border-amber"
        >
          <MessageCircle size={15} className="text-amber" aria-hidden="true" />
          Ask me
        </button>
      )}
      {open && <AskPanel onClose={() => setOpen(false)} />}
    </>
  );
}

export default AskLauncher;
