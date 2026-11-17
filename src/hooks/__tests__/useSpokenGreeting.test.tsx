import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { dwellMs, resetManifestCache, useSpokenGreeting } from "../useSpokenGreeting";

const hindi = { language: "Hindi", lang: "hi", text: "नमस्ते", meaning: "Hello" };
const longSanskrit = { language: "Sanskrit", lang: "sa", text: "भवन्तं दृष्ट्वा हर्षोऽभवत्", meaning: "Nice to meet you" };

type Voice = { name: string; lang: string; localService?: boolean };
type Spoken = { text: string; voice: Voice; lang: string; rate: number; onend: (() => void) | null; onerror: (() => void) | null };

function installSpeech(initialVoices: Voice[]) {
  let voices = initialVoices;
  const listeners = new Set<() => void>();
  const spoken: Spoken[] = [];
  const synth = {
    speak: (u: Spoken) => spoken.push(u),
    cancel: vi.fn(),
    getVoices: () => voices,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  class Utterance {
    text: string;
    voice: Voice = { name: "", lang: "" };
    lang = "";
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  return {
    spoken,
    synth,
    loadVoices(next: Voice[]) {
      voices = next;
      listeners.forEach((fn) => fn());
    },
  };
}

function installManifest(manifest: Record<string, Record<string, string>>) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
}

class FakeAudio {
  static made: FakeAudio[] = [];
  src: string;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(src: string) {
    this.src = src;
    FakeAudio.made.push(this);
  }
  play() {
    return Promise.resolve();
  }
  pause() {}
}

const flush = (ms: number) =>
  act(async () => {
    vi.advanceTimersByTime(ms);
  });

beforeEach(() => {
  vi.useFakeTimers();
  resetManifestCache();
  FakeAudio.made = [];
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useSpokenGreeting: voice choice", () => {
  it("speaks with the most natural voice for the language", async () => {
    installManifest({});
    const speech = installSpeech([
      { name: "eSpeak Hindi", lang: "hi" },
      { name: "Microsoft Swara Online (Natural) - Hindi (India)", lang: "hi-IN" },
    ]);
    const { result } = renderHook(() => useSpokenGreeting(true, hindi));
    await flush(300);

    expect(speech.spoken).toHaveLength(1);
    expect(speech.spoken[0].text).toBe("नमस्ते");
    expect(speech.spoken[0].voice.name).toContain("Natural");
    expect(speech.spoken[0].lang).toBe("hi-IN");
    expect(speech.spoken[0].rate).toBeLessThan(1);
    expect(result.current.missing).toBe(false);
  });

  it("plays your own recording instead of a device voice when you added one", async () => {
    installManifest({ hi: { hello: "hi-hello.mp3" } });
    const speech = installSpeech([{ name: "Lekha", lang: "hi-IN" }]);
    const { result } = renderHook(() => useSpokenGreeting(true, hindi));
    await flush(300);

    expect(FakeAudio.made.map((a) => a.src)).toEqual(["/greetings/hi-hello.mp3"]);
    expect(speech.spoken).toHaveLength(0);
    expect(result.current.missing).toBe(false);
  });

  it("says so when the device has no voice for the language", async () => {
    installManifest({});
    const speech = installSpeech([{ name: "Samantha", lang: "en-US" }]);
    const { result } = renderHook(() => useSpokenGreeting(true, hindi));
    await flush(300);

    expect(speech.spoken).toHaveLength(0);
    expect(result.current.missing).toBe(true);
  });

  it("waits for the browser's voices to finish loading", async () => {
    installManifest({});
    const speech = installSpeech([]); // voices not loaded yet
    const { result } = renderHook(() => useSpokenGreeting(true, hindi));
    await flush(200);
    expect(speech.spoken).toHaveLength(0);

    act(() => speech.loadVoices([{ name: "Lekha", lang: "hi-IN" }]));
    await flush(300);
    expect(speech.spoken).toHaveLength(1);
    expect(result.current.missing).toBe(false);
  });

  it("stops talking when switched off", async () => {
    installManifest({});
    const speech = installSpeech([{ name: "Lekha", lang: "hi-IN" }]);
    const { rerender } = renderHook(({ on }) => useSpokenGreeting(on, hindi), { initialProps: { on: true } });
    await flush(300);
    speech.synth.cancel.mockClear();

    rerender({ on: false });
    await flush(10);
    expect(speech.synth.cancel).toHaveBeenCalled();
  });
});

describe("useSpokenGreeting: never cut a greeting off", () => {
  it("waits for a long phrase to finish, then pauses briefly before moving on", async () => {
    installManifest({});
    const speech = installSpeech([{ name: "Lekha", lang: "hi-IN" }]);
    const onFinished = vi.fn();
    renderHook(() => useSpokenGreeting(true, longSanskrit, onFinished));
    await flush(300);
    expect(speech.spoken).toHaveLength(1);
    speech.synth.cancel.mockClear();

    await flush(4000); // still being spoken: nothing may interrupt it
    expect(onFinished).not.toHaveBeenCalled();
    expect(speech.synth.cancel).not.toHaveBeenCalled();

    act(() => speech.spoken[0].onend?.());
    await flush(300);
    expect(onFinished).not.toHaveBeenCalled(); // the short breath between greetings
    await flush(400);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("leaves enough time to read when there is nothing to say", async () => {
    installManifest({});
    installSpeech([{ name: "Samantha", lang: "en-US" }]);
    const onFinished = vi.fn();
    renderHook(() => useSpokenGreeting(true, hindi, onFinished));
    await flush(300);
    expect(onFinished).not.toHaveBeenCalled();
    await flush(dwellMs(hindi.text));
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("moves on after a recording ends", async () => {
    installManifest({ hi: { hello: "hi-hello.mp3" } });
    installSpeech([]);
    const onFinished = vi.fn();
    renderHook(() => useSpokenGreeting(true, hindi, onFinished));
    await flush(300);

    await flush(3000);
    expect(onFinished).not.toHaveBeenCalled(); // the clip is still playing
    act(() => FakeAudio.made[0].onended?.());
    await flush(700);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("does not get stuck if the browser never reports the end of speech", async () => {
    installManifest({});
    installSpeech([{ name: "Lekha", lang: "hi-IN" }]);
    const onFinished = vi.fn();
    renderHook(() => useSpokenGreeting(true, hindi, onFinished));
    await flush(300);
    await flush(5200);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("does not move on after being switched off", async () => {
    installManifest({});
    const speech = installSpeech([{ name: "Lekha", lang: "hi-IN" }]);
    const onFinished = vi.fn();
    const { rerender } = renderHook(({ on }) => useSpokenGreeting(on, hindi, onFinished), { initialProps: { on: true } });
    await flush(300);
    rerender({ on: false });
    act(() => speech.spoken[0].onend?.());
    await flush(2000);
    expect(onFinished).not.toHaveBeenCalled();
  });
});
