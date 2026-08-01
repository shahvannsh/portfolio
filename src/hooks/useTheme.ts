import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

let theme: Theme = getInitialTheme();
const listeners = new Set<() => void>();

function applyTheme(next: Theme) {
  document.documentElement.classList.toggle("light", next === "light");
  window.localStorage.setItem("theme", next);
}

if (typeof document !== "undefined") {
  applyTheme(theme);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return theme;
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function setTheme(next: Theme | ((current: Theme) => Theme)) {
  theme = typeof next === "function" ? next(theme) : next;
  applyTheme(theme);
  listeners.forEach((callback) => callback());
}

export function toggleTheme() {
  setTheme((current) => (current === "dark" ? "light" : "dark"));
}

/** Subscribes the calling component to theme changes from any source. */
export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
