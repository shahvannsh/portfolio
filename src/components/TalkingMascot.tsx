import { useState } from "react";
import { Play } from "lucide-react";
import Mascot from "./Mascot";
import IntroVideoDialog from "./IntroVideoDialog";

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
