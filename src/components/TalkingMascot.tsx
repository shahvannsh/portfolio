import { useState } from "react";
import { Play, X } from "lucide-react";
import Mascot from "./Mascot";
import { useDialog } from "../hooks/useDialog";

function IntroVideoDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useDialog<HTMLButtonElement>(true, onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vannsh's video introduction"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-amber/40 bg-black shadow-[0_0_40px_rgba(255,122,51,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-2 top-2 z-10 rounded-full border border-amber/40 bg-black/70 p-1.5 text-ink transition-colors hover:border-amber hover:text-amber"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <video
          className="block aspect-video w-full"
          src="/intro.mp4"
          poster="/intro-poster.jpg"
          controls
          autoPlay
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}

function TalkingMascot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Mascot
        directions="/mascots/vannsh-directions.webp"
        reactions="/mascots/vannsh-reactions.webp"
        size={95}
        label="Vannsh chibi mascot"
      />
      <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber/40 bg-panel/90 px-3 py-1.5 font-mono text-[11px] text-ink shadow-[0_0_14px_rgba(255,122,51,0.2)] backdrop-blur-md transition-colors hover:border-amber"
        >
          <Play size={12} aria-hidden="true" />
          Watch my intro
        </button>
      </div>
      {open && <IntroVideoDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

export default TalkingMascot;
