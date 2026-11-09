import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TalkingMascot from "../TalkingMascot";

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("TalkingMascot", () => {
  it("renders only the mascot when speech is unsupported", () => {
    render(<TalkingMascot />);
    expect(screen.getByRole("button", { name: /boop the/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /hear my intro/i })).toBeNull();
  });

  it("speaks the intro in first person when played", () => {
    const synth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [],
    };
    class FakeUtterance {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("speechSynthesis", synth);
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    render(<TalkingMascot />);
    fireEvent.click(screen.getByRole("button", { name: /hear my intro/i }));

    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/I'm Vannsh Shah/)).toBeInTheDocument();
  });
});
