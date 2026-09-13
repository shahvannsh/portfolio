import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme, setTheme, toggleTheme } from "../useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("light");
    act(() => setTheme("dark"));
  });

  it("starts at dark by default in this test environment", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("dark");
  });

  it("toggleTheme flips between dark and light", () => {
    const { result } = renderHook(() => useTheme());

    act(() => toggleTheme());
    expect(result.current).toBe("light");

    act(() => toggleTheme());
    expect(result.current).toBe("dark");
  });

  it("applies the 'light' class to the document root when set to light", () => {
    act(() => setTheme("light"));
    expect(document.documentElement.classList.contains("light")).toBe(true);

    act(() => setTheme("dark"));
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("persists the choice to localStorage", () => {
    act(() => setTheme("light"));
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("keeps multiple subscribed components in sync with a single source of truth", () => {
    const a = renderHook(() => useTheme());
    const b = renderHook(() => useTheme());

    act(() => toggleTheme());

    expect(a.result.current).toBe(b.result.current);
    expect(a.result.current).toBe("light");
  });
});
