import { describe, expect, it } from "vitest";
import { festivalOn } from "../festivals";
import { GREETING_STEPS, greetingSequence } from "../greetings";

const on = (iso: string) => festivalOn(new Date(`${iso}T12:00:00`))?.name ?? null;

describe("festivalOn", () => {
  it("knows fixed-date occasions every year", () => {
    expect(on("2026-01-01")).toBe("New Year");
    expect(on("2027-01-26")).toBe("Republic Day");
    expect(on("2030-08-15")).toBe("Independence Day");
    expect(on("2026-09-05")).toBe("Teachers' Day");
  });

  it("knows the moving festivals for 2026 and 2027", () => {
    expect(on("2026-09-14")).toBe("Ganesh Chaturthi");
    expect(on("2026-11-08")).toBe("Diwali");
    expect(on("2026-03-04")).toBe("Holi");
    expect(on("2027-10-29")).toBe("Diwali");
    expect(on("2027-03-23")).toBe("Holi");
  });

  it("is quiet on ordinary days", () => {
    expect(on("2026-11-11")).toBeNull();
    expect(on("2026-06-10")).toBeNull();
  });
});

describe("greetingSequence", () => {
  it("puts festival wishes first, then the usual loop", () => {
    const festival = festivalOn(new Date("2026-11-08T12:00:00"));
    const seq = greetingSequence(festival, "Good morning");
    expect(seq).toHaveLength(GREETING_STEPS + (festival?.phrases.length ?? 0));
    expect(seq[0].text).toMatch(/दीपावली/);
    expect(seq[festival?.phrases.length ?? 0].text).toBe("Good morning");
  });

  it("uses only the usual loop on ordinary days", () => {
    expect(greetingSequence(null, "Hello")).toHaveLength(GREETING_STEPS);
  });
});
