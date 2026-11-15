import { describe, expect, it } from "vitest";
import { pickBestVoice, scoreVoice, slugify } from "../voices";

const v = (name: string, lang: string, extra: { localService?: boolean; default?: boolean } = {}) => ({ name, lang, ...extra });

describe("pickBestVoice", () => {
  const voices = [
    v("eSpeak Hindi", "hi"),
    v("Google हिन्दी", "hi-IN"),
    v("Microsoft Swara Online (Natural) - Hindi (India)", "hi-IN"),
    v("Samantha", "en-US", { localService: true }),
    v("Veena", "en-IN"),
    v("Daniel", "en-GB"),
    v("Kyoko", "ja-JP", { localService: true }),
    v("Zarvox", "ja-JP"),
    v("Anna", "de-DE"),
  ];

  it("prefers the natural-sounding voice over robotic and basic ones", () => {
    expect(pickBestVoice(voices, "hi")?.name).toBe("Microsoft Swara Online (Natural) - Hindi (India)");
    expect(pickBestVoice(voices, "ja")?.name).toBe("Kyoko");
  });

  it("likes Indian English best, and still finds other accents", () => {
    expect(pickBestVoice(voices, "en")?.name).toBe("Veena");
    expect(pickBestVoice(voices.filter((x) => x.name !== "Veena"), "en")?.name).toBe("Daniel");
  });

  it("reads Sanskrit with a Hindi voice", () => {
    expect(pickBestVoice(voices, "sa")?.name).toBe("Microsoft Swara Online (Natural) - Hindi (India)");
  });

  it("returns null when the device has no voice for the language, instead of guessing", () => {
    expect(pickBestVoice(voices, "gu")).toBeNull();
    expect(pickBestVoice(voices, "mr")).toBeNull();
    expect(pickBestVoice([], "hi")).toBeNull();
  });

  it("copes with underscore locales and region-less codes", () => {
    expect(pickBestVoice([v("Lekha", "hi_IN")], "hi")?.name).toBe("Lekha");
    expect(scoreVoice(v("X", "hi"), "hi")).not.toBeNull();
    expect(scoreVoice(v("X", "fr-FR"), "hi")).toBeNull();
  });
});

describe("slugify", () => {
  it("turns phrase names into clip names", () => {
    expect(slugify("Hello")).toBe("hello");
    expect(slugify("How are you?")).toBe("how-are-you");
    expect(slugify("Nice to meet you")).toBe("nice-to-meet-you");
    expect(slugify("Teachers' Day")).toBe("teachers-day");
  });
});
