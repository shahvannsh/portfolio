import { useEffect, useRef } from "react";

/**
 * Fires `onOpen` on Cmd+K (Mac) or Ctrl+K (Windows/Linux), anywhere on
 * the page — including while a text field is focused, since that's
 * the expected behavior for command palettes and doesn't collide with
 * normal typing (no modifier key is used for anything else here).
 */
export function useCommandPaletteShortcut(onOpen: () => void) {
  const callback = useRef(onOpen);
  callback.current = onOpen;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        callback.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
