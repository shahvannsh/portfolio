import { useCallback, useEffect, useRef, useState } from "react";

export type Track = { title: string; src: string };

/**
 * A looping playlist the visitor switches on themselves (browsers block autoplay).
 * It pauses while `suspended` is true or the tab is hidden, and resumes afterwards.
 */
export function useBackgroundMusic(tracks: readonly Track[], suspended = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [index, setIndex] = useState(0);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(tracks[index].src);
      audio.loop = true;
      audio.volume = 0.35;
      audio.preload = "none";
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    if (playing) {
      setPlaying(false);
      audio.pause();
      return;
    }
    setPlaying(true);
    // play() must start inside the tap so iOS allows it.
    const attempt = audio.play();
    if (attempt) {
      attempt.catch(() => setPlaying(false));
    }
  }, [playing, tracks, index]);

  const next = useCallback(() => {
    const following = (index + 1) % tracks.length;
    setIndex(following);
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.src = tracks[following].src;
    audio.load();
    if (playing) {
      const attempt = audio.play();
      if (attempt) {
        attempt.catch(() => setPlaying(false));
      }
    }
  }, [index, playing, tracks]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) {
      return;
    }
    if (suspended || hidden) {
      audio.pause();
    } else {
      const attempt = audio.play();
      if (attempt) {
        attempt.catch(() => undefined);
      }
    }
  }, [playing, suspended, hidden]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return { playing, toggle, next, track: tracks[index] };
}
