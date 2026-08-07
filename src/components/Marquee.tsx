import { memo, useEffect, useRef, useState } from "react";
import { modules } from "../data/content";

function Marquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const val = (window.innerHeight - rect.top) * 0.25;
      setOffset(val);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const row1 = [...modules, ...modules, ...modules];
  const row2 = [
    ...modules.slice().reverse(),
    ...modules.slice().reverse(),
    ...modules.slice().reverse(),
  ];

  return (
    <div ref={sectionRef} className="overflow-hidden border-y border-line py-10">
      <div
        className="mb-4 flex w-max gap-4"
        style={{ transform: `translateX(${-(offset % 2000)}px)`, willChange: "transform" }}
      >
        {row1.map((m, i) => (
          <span
            key={`r1-${i}`}
            className="whitespace-nowrap rounded-full border border-line bg-panel px-5 py-2 font-mono text-xs uppercase tracking-widest text-amber-soft"
          >
            {m}
          </span>
        ))}
      </div>
      <div
        className="flex w-max gap-4"
        style={{ transform: `translateX(${(offset % 2000) - 2000}px)`, willChange: "transform" }}
      >
        {row2.map((m, i) => (
          <span
            key={`r2-${i}`}
            className="whitespace-nowrap rounded-full border border-line bg-panel2 px-5 py-2 font-mono text-xs uppercase tracking-widest text-cyan-soft"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(Marquee);
