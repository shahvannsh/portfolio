import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forSpeech, guessLang, speakReply } from "../speech";

describe("forSpeech", () => {
  it("removes emoji, links and bullets", () => {
    const text = "Here's my journey 🎉:\n• Jun–Aug 2026: AI-ML Intern\n• See https://example.com/x for more.";
    const spoken = forSpeech(text);
    expect(spoken).not.toMatch(/https?:|•|🎉/);
    expect(spoken).toContain("AI-ML Intern");
  });

  it("keeps only the first few sentences so answers stay short", () => {
    const text = "One is here. Two is here. Three is here. Four is here. Five is here.";
    expect(forSpeech(text)).toBe("One is here. Two is here. Three is here.");
  });

  it("never exceeds the limit, even for one very long sentence", () => {
    const spoken = forSpeech("word ".repeat(200), 100);
    expect(spoken.length).toBeLessThanOrEqual(100);
    expect(spoken.endsWith("…")).toBe(true);
  });

  it("returns nothing for empty text", () => {
    expect(forSpeech("   ")).toBe("");
  });
});

describe("guessLang", () => {
  it("recognises the scripts we speak", () => {
    expect(guessLang("Hello there")).toBe("en");
    expect(guessLang("नमस्ते")).toBe("hi");
    expect(guessLang("નમસ્તે")).toBe("gu");
    expect(guessLang("こんにちは")).toBe("ja");
  });
});

describe("speakReply", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function install(voices: { name: string; lang: string }[]) {
    const spoken: { text: string; onend: (() => void) | null }[] = [];
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("speechSynthesis", { speak: (u: (typeof spoken)[number]) => spoken.push(u), cancel: vi.fn(), getVoices: () => voices, speaking: false, pending: false });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        text: string;
        voice: unknown;
        lang = "";
        rate = 1;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    return spoken;
  }

  it("speaks the answer and then says it's done", () => {
    const spoken = install([{ name: "Veena", lang: "en-IN" }]);
    const done = vi.fn();
    speakReply("I built Chotu. It is an assistant.", done);
    vi.advanceTimersByTime(10);
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe("I built Chotu. It is an assistant.");
    expect(done).toHaveBeenCalledTimes(0);
    spoken[0].onend?.();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("finishes at once when there is no suitable voice, so a conversation never stalls", () => {
    const spoken = install([{ name: "Veena", lang: "en-IN" }]);
    const done = vi.fn();
    speakReply("नमस्ते", done); // no Hindi voice: don't read it with an English one
    expect(done).toHaveBeenCalledTimes(1);
    expect(spoken).toHaveLength(0);
  });

  it("does not hang if the browser never reports the end", () => {
    install([{ name: "Veena", lang: "en-IN" }]);
    const done = vi.fn();
    speakReply("A short answer.", done);
    vi.advanceTimersByTime(7000);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("can be stopped without calling done", () => {
    install([{ name: "Veena", lang: "en-IN" }]);
    const done = vi.fn();
    const stop = speakReply("A short answer.", done);
    stop();
    vi.advanceTimersByTime(7000);
    expect(done).toHaveBeenCalledTimes(0);
  });
});
