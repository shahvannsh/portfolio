import type { Track } from "../hooks/useBackgroundMusic";

// Original Indian x tech tunes (see make_tunes.py). Builder is the signature track.
export const TUNES: readonly Track[] = [
  { title: "Builder", src: "/music/builder.mp3" },
  { title: "Pune Evenings", src: "/music/pune-evenings.mp3" },
  { title: "Neural Drift", src: "/music/neural-drift.mp3" },
];

/** The main portfolio plays just the signature track. */
export const BUILDER_ONLY: readonly Track[] = [TUNES[0]];
