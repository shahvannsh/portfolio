import { useState } from "react";
import { Copy, Download, Share2, X } from "lucide-react";
import { useDialog } from "../hooks/useDialog";
import { track } from "../lib/analytics";

export const SHARE_URL = "https://portfolio-mu-ruby-37.vercel.app/card?utm_source=share&utm_medium=card";

const action =
  "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-amber/50 bg-amber/10 px-3 font-mono text-xs text-ink transition-colors hover:border-amber hover:bg-amber/15";

/** A QR code and share sheet so people without NFC can still pick up the card. */
function ShareCard({ onClose }: { onClose: () => void }) {
  const closeRef = useDialog<HTMLButtonElement>(true, onClose);
  const [note, setNote] = useState("");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = async () => {
    track("share_card");
    try {
      await navigator.share({
        title: "Vannsh Shah — contact card",
        text: "Tap to connect with Vannsh Shah",
        url: SHARE_URL,
      });
    } catch {
      // Dismissed by the visitor.
    }
  };

  const copy = async () => {
    track("copy_card_link");
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setNote("Link copied!");
    } catch {
      setNote("Couldn't copy. Long-press the QR code to save it instead.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Vannsh's card"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-2xl border border-amber/40 bg-panel p-5 text-center shadow-[0_0_40px_rgba(255,122,51,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close share"
          className="absolute right-2 top-2 rounded-full border border-amber/40 p-1.5 text-ink transition-colors hover:border-amber hover:text-amber"
        >
          <X size={14} aria-hidden="true" />
        </button>
        <p className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">Share my card</p>
        <p className="mt-1 font-mono text-[11px] text-mute">Scan with a phone camera, or send the link.</p>
        <img
          src="/card-qr.svg"
          alt="QR code that opens Vannsh's contact card"
          width={200}
          height={200}
          className="mx-auto mt-4 rounded-xl bg-white p-2"
        />
        <div className="mt-4 flex gap-2">
          {canShare && (
            <button type="button" onClick={share} className={action}>
              <Share2 size={14} aria-hidden="true" /> Share
            </button>
          )}
          <button type="button" onClick={copy} className={action}>
            <Copy size={14} aria-hidden="true" /> Copy link
          </button>
          <a href="/card-qr.svg" download="Vannsh-Shah-card-QR.svg" className={action} aria-label="Save QR code">
            <Download size={14} aria-hidden="true" /> QR
          </a>
        </div>
        <p role="status" className="mt-2 min-h-[1rem] font-mono text-[11px] text-amber">
          {note}
        </p>
      </div>
    </div>
  );
}

export default ShareCard;
