import { X } from "lucide-react";
import { useDialog } from "../hooks/useDialog";

export default function IntroVideoDialog({ onClose, onEnded }: { onClose: () => void; onEnded?: () => void }) {
  const closeRef = useDialog<HTMLButtonElement>(true, onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vannsh's video introduction"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[min(96vw,calc(88dvh*16/9))] overflow-hidden rounded-xl border border-amber/40 bg-black shadow-[0_0_40px_rgba(255,122,51,0.25)]"
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
          className="block aspect-video w-full bg-black object-contain"
          src="/intro.mp4"
          poster="/intro-poster.jpg"
          controls
          autoPlay
          playsInline
          onEnded={onEnded}
          preload="metadata"
        >
          {/* Optional captions for screen readers and sound-off viewing (the video also has its own on-screen captions). */}
          <track kind="captions" src="/intro.vtt" srcLang="en" label="English" />
        </video>
      </div>
    </div>
  );
}
