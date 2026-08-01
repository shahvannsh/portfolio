import { useEffect, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Fires `onUnlock` once the classic Konami sequence is typed.
 * Progress resets on any wrong key. Single keydown listener,
 * removed on unmount — safe under React Strict Mode's
 * mount/unmount/mount dev cycle.
 */
export function useKonamiCode(onUnlock: () => void) {
  const progress = useRef(0);
  const callback = useRef(onUnlock);
  callback.current = onUnlock;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const expected = KONAMI_SEQUENCE[progress.current];
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI_SEQUENCE.length) {
          progress.current = 0;
          callback.current();
        }
      } else {
        // Allow the sequence to restart immediately on the key that broke it
        progress.current = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
