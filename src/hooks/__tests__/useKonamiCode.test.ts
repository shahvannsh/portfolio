import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKonamiCode } from "../useKonamiCode";

const SEQUENCE = [
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

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

describe("useKonamiCode", () => {
  it("fires onUnlock after the exact sequence", () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));

    SEQUENCE.forEach(pressKey);

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("does not fire on an incomplete sequence", () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));

    SEQUENCE.slice(0, -1).forEach(pressKey);

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("does not fire on a wrong sequence", () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));

    ["ArrowUp", "ArrowDown", "ArrowUp", "ArrowDown"].forEach(pressKey);

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("resets progress after a wrong key, then can still succeed on a fresh attempt", () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));

    pressKey("ArrowUp");
    pressKey("ArrowUp");
    pressKey("x"); // breaks the sequence
    SEQUENCE.forEach(pressKey); // fresh, complete attempt

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("can be triggered multiple times across repeated correct sequences", () => {
    const onUnlock = vi.fn();
    renderHook(() => useKonamiCode(onUnlock));

    SEQUENCE.forEach(pressKey);
    SEQUENCE.forEach(pressKey);

    expect(onUnlock).toHaveBeenCalledTimes(2);
  });

  it("removes its listener on unmount", () => {
    const onUnlock = vi.fn();
    const { unmount } = renderHook(() => useKonamiCode(onUnlock));
    unmount();

    SEQUENCE.forEach(pressKey);

    expect(onUnlock).not.toHaveBeenCalled();
  });
});
