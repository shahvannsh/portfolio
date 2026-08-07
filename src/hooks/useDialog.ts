import { useEffect, useRef } from "react";

/**
 * Shared behavior for any modal/dialog-like overlay:
 * - Escape key closes it
 * - focus moves to a target element (usually a close button or search
 *   input) when it opens
 * - focus returns to whatever was focused before it opened, once it closes
 *
 * Consolidates logic that was previously hand-rolled three separate times
 * across EasterEggOverlay, CommandPalette, and Navbar's mobile menu, which
 * had drifted out of sync (Navbar never restored focus on close).
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const focusTargetRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Wait a tick so the target element exists post-mount/animation.
      requestAnimationFrame(() => focusTargetRef.current?.focus());
    } else {
      previouslyFocused.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return focusTargetRef;
}
