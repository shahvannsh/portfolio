import { describe, expect, it } from "vitest";
import { GREETING_STEPS, LANGUAGES, greetingAt } from "../greetings";

describe("greetings", () => {
  it("has the same eight phrases in every language on the resume", () => {
    expect(LANGUAGES.map((l) => l.language)).toEqual([
      "English", "Hindi", "Marathi", "Gujarati", "German", "Japanese", "Sanskrit",
    ]);
    for (const language of LANGUAGES) {
      expect(language.phrases).toHaveLength(8);
      expect(language.phrases.every((p) => p.text.trim().length > 0)).toBe(true);
    }
    expect(GREETING_STEPS).toBe(56);
  });

  it("goes through each phrase in every language, then repeats", () => {
    expect(greetingAt(0)).toMatchObject({ language: "English", meaning: "Hello" });
    expect(greetingAt(1)).toMatchObject({ language: "Hindi", text: "नमस्ते" });
    expect(greetingAt(35)).toMatchObject({ language: "English", meaning: "Good luck" });
    expect(greetingAt(42)).toMatchObject({ language: "English", meaning: "See you soon" });
    expect(greetingAt(49)).toMatchObject({ language: "English", meaning: "Good night" });
    expect(greetingAt(55)).toMatchObject({ language: "Sanskrit", text: "शुभरात्रिः" });
    expect(greetingAt(56)).toEqual(greetingAt(0));
  });
});
