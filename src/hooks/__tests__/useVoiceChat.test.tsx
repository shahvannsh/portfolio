import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { describeVoiceError, useVoiceChat } from "../useVoiceChat";

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = "";
  continuous = true;
  interimResults = false;
  maxAlternatives = 0;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  aborted = false;
  constructor() {
    FakeRecognition.instances.push(this);
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onend?.();
  }
  abort() {
    this.aborted = true;
  }
  emit(text: string, isFinal: boolean) {
    this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal })] });
  }
  emitFinal(text: string) {
    this.emit(text, true);
    this.onend?.(); // real browsers end the session right after the final result
  }
}

beforeEach(() => {
  FakeRecognition.instances = [];
  vi.stubGlobal("webkitSpeechRecognition", FakeRecognition);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const last = () => FakeRecognition.instances[FakeRecognition.instances.length - 1];

describe("useVoiceChat", () => {
  it("starts one short listening session in the chosen language", () => {
    const { result } = renderHook(() => useVoiceChat({ lang: "hi-IN", onFinal: () => undefined }));
    expect(result.current.supported).toBe(true);
    act(() => result.current.start());
    act(() => result.current.start()); // a second tap must not open a second session

    expect(FakeRecognition.instances).toHaveLength(1);
    expect(last().lang).toBe("hi-IN");
    expect(last().interimResults).toBe(true);
    expect(last().continuous).toBe(false);
    expect(result.current.listening).toBe(true);
  });

  it("shows what is being said, then hands over the finished question once", () => {
    const onFinal = vi.fn();
    const onEnd = vi.fn();
    const { result } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal, onEnd }));
    act(() => result.current.start());

    act(() => last().emit("what are your", false));
    expect(result.current.interim).toBe("what are your");
    expect(onFinal).toHaveBeenCalledTimes(0);

    act(() => last().emitFinal("  What are your skills  "));
    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0][0]).toBe("What are your skills");
    expect(onEnd.mock.calls[0][0]).toEqual({ heard: true, error: null });
    expect(result.current.listening).toBe(false);
    expect(result.current.interim).toBe("");
  });

  it("explains problems in plain words", () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal: () => undefined, onEnd }));

    act(() => result.current.start());
    act(() => last().onerror?.({ error: "no-speech" }));
    act(() => last().onend?.());
    expect(result.current.error).toMatch(/didn't hear anything/i);
    expect(onEnd.mock.calls[0][0]).toEqual({ heard: false, error: "no-speech" });

    act(() => result.current.start());
    act(() => last().onerror?.({ error: "not-allowed" }));
    expect(result.current.error).toMatch(/microphone is blocked/i);
    expect(describeVoiceError("network")).toMatch(/couldn't be reached/i);
    expect(describeVoiceError("something-new")).toMatch(/type instead/i);
  });

  it("ignores the browser's 'aborted' notice when you stop it yourself", () => {
    const { result } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal: () => undefined }));
    act(() => result.current.start());
    act(() => last().onerror?.({ error: "aborted" }));
    expect(result.current.error).toBe("");
  });

  it("stops listening on request", () => {
    const { result } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal: () => undefined }));
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(result.current.listening).toBe(false);
  });

  it("lets go of the microphone when the chat closes", () => {
    const onFinal = vi.fn();
    const { result, unmount } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal }));
    act(() => result.current.start());
    const rec = last();
    unmount();
    expect(rec.aborted).toBe(true);
    expect(rec.onresult).toBeNull();
    expect(onFinal).toHaveBeenCalledTimes(0);
  });

  it("reports that voice isn't supported in browsers without speech recognition", () => {
    vi.unstubAllGlobals();
    const { result } = renderHook(() => useVoiceChat({ lang: "en-IN", onFinal: () => undefined }));
    expect(result.current.supported).toBe(false);
    act(() => result.current.start());
    expect(FakeRecognition.instances).toHaveLength(0);
  });
});
