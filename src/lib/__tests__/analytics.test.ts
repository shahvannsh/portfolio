import { afterEach, describe, expect, it, vi } from "vitest";
import { track } from "../analytics";

afterEach(() => {
  delete window.va;
});

describe("track", () => {
  it("sends named events to Vercel analytics", () => {
    window.va = vi.fn();
    track("save_contact", { source: "card" });
    expect(window.va).toHaveBeenCalledWith("event", { name: "save_contact", source: "card" });
  });

  it("does nothing, and never throws, when analytics isn't loaded", () => {
    expect(() => track("save_contact")).not.toThrow();
    window.va = () => {
      throw new Error("blocked");
    };
    expect(() => track("save_contact")).not.toThrow();
  });
});
