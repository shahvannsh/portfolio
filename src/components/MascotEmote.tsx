export type EmoteKind =
  | "heart"
  | "sparkle"
  | "zzz"
  | "exclaim"
  | "question"
  | "music"
  | "laugh"
  | "dots";

export type Emote = { kind: EmoteKind; id: number };

const GLYPHS: Record<EmoteKind, string[]> = {
  heart: ["❤", "❤", "❤"],
  sparkle: ["✦", "✧", "✦"],
  zzz: ["Z", "z", "z"],
  exclaim: ["!"],
  question: ["?"],
  music: ["♪", "♫", "♪"],
  laugh: ["ha", "ha", "ha!"],
  dots: ["…"],
};

/** Little symbols that float up from the mascot. Remounts whenever `emote.id` changes. */
export function MascotEmote({ emote }: { emote: Emote | null }) {
  if (!emote) {
    return null;
  }
  return (
    <span
      key={emote.id}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-5 z-10 flex justify-center gap-1.5 font-mono text-sm font-bold text-amber"
    >
      {GLYPHS[emote.kind].map((glyph, i) => (
        <span key={i} className="mascot-emote" style={{ animationDelay: `${i * 140}ms` }}>
          {glyph}
        </span>
      ))}
    </span>
  );
}

export default MascotEmote;
