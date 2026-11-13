declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
  }
}

/** Sends a custom event to Vercel Web Analytics (a no-op if analytics isn't enabled or loaded). */
export function track(name: string, data?: Record<string, string | number>) {
  try {
    window.va?.("event", { name, ...data });
  } catch {
    // Analytics must never break the page.
  }
}
