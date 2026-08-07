import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClickCombo } from "../useClickCombo";

describe("useClickCombo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onUnlock after the configured number of rapid clicks", () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useClickCombo(onUnlock, 5, 1500));

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current();
        vi.advanceTimersByTime(50);
      }
    });

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("does not fire before the required click count is reached", () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useClickCombo(onUnlock, 5, 1500));

    act(() => {
      for (let i = 0; i < 4; i++) {
        result.current();
        vi.advanceTimersByTime(50);
      }
    });

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("does not fire if clicks are spaced beyond the combo window", () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useClickCombo(onUnlock, 5, 1500));

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current();
        vi.advanceTimersByTime(2000); // exceeds the 1500ms window every time
      }
    });

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("resets the counter after firing, so a second combo can trigger again", () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useClickCombo(onUnlock, 5, 1500));

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current();
        vi.advanceTimersByTime(50);
      }
      for (let i = 0; i < 5; i++) {
        result.current();
        vi.advanceTimersByTime(50);
      }
    });

    expect(onUnlock).toHaveBeenCalledTimes(2);
  });

  it("respects a custom click count", () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useClickCombo(onUnlock, 3, 1500));

    act(() => {
      for (let i = 0; i < 3; i++) {
        result.current();
        vi.advanceTimersByTime(50);
      }
    });

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});
