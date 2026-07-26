const readouts = [
  "STATUS: ONLINE",
  "ROLE: CS ENGINEER \u2014 AI/ML",
  "CERTS: 16 COMPLETED",
  "CURRENT BUILD: CHOTU AI ASSISTANT",
  "LOCATION: PUNE, INDIA",
  "YEAR: 3RD \u00b7 B.TECH CSE",
];

export default function HUDTicker() {
  const loop = [...readouts, ...readouts];
  return (
    <div className="w-full overflow-hidden border-b border-line bg-panel2 font-mono text-[11px] tracking-[0.2em] text-cyan">
      <div className="flex w-max animate-[ticker_28s_linear_infinite] py-1.5">
        {loop.map((r, i) => (
          <span key={i} className="mx-6 flex items-center gap-2 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_6px_#FF7A33]" />
            {r}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
