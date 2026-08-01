import { useCallback, useRef } from "react";

/**
 * Returns an onClick handler that fires `onUnlock` after `count`
 * clicks land within `windowMs` of each other. No listeners are
 * attached (it's a plain click handler), so there's nothing to
 * leak or double-register under Strict Mode.
 */
export function useClickCombo(onUnlock: () => void, count = 5, windowMs = 1500) {
  const clicks = useRef(0);
  const lastClick = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClick.current > windowMs) {
      clicks.current = 0;
    }
    lastClick.current = now;
    clicks.current += 1;

    if (clicks.current >= count) {
      clicks.current = 0;
      onUnlock();
    }
  }, [onUnlock, count, windowMs]);

  return handleClick;
}
