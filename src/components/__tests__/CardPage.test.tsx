import { afterEach, describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CardPage from "../CardPage";

// The real date could be a festival (which changes the first greeting), so keep tests deterministic.
vi.mock("../../data/festivals", () => ({ festivalOn: () => null }));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CardPage", () => {
  it("shows the name and role", () => {
    render(<CardPage />);
    expect(screen.getByRole("heading", { name: /vannsh shah/i })).toBeInTheDocument();
  });

  it("links every contact action", () => {
    render(<CardPage />);
    const href = (name: RegExp) => screen.getByRole("link", { name }).getAttribute("href");
    expect(href(/save contact/i)).toBe("/contact.vcf");
    expect(href(/call/i)).toBe("tel:+918668995892");
    expect(href(/email/i)).toBe("mailto:shahvannsh@gmail.com");
    expect(href(/whatsapp/i)).toBe("https://wa.me/918668995892");
    expect(href(/instagram/i)).toBe("https://instagram.com/vannsh_shah_2006");
    expect(href(/resume/i)).toBe("/Vannsh-Shah-Resume.pdf");
  });

  it("greets the visitor and points to the video", () => {
    render(<CardPage />);
    expect(screen.getByRole("status")).toHaveTextContent(/watch my intro/i);
    expect(screen.getByRole("status")).toHaveTextContent(/english/i);
  });

  it("greets in each language from the resume, with new phrases each round", () => {
    vi.useFakeTimers();
    render(<CardPage />);
    const tick = () =>
      act(() => {
        vi.advanceTimersByTime(2400);
      });
    const status = () => screen.getByRole("status");

    // Round 1: hello in every language.
    for (const [language, text] of [
      ["Hindi", "नमस्ते"],
      ["Marathi", "नमस्कार"],
      ["Gujarati", "નમસ્તે"],
      ["German", "Hallo"],
      ["Japanese", "こんにちは"],
      ["Sanskrit", "नमो नमः"],
    ]) {
      tick();
      expect(status()).toHaveTextContent(language);
      expect(status()).toHaveTextContent(text);
    }

    // Round 2: how are you?
    tick();
    expect(status()).toHaveTextContent("How are you?");
    tick();
    expect(status()).toHaveTextContent("आप कैसे हैं?");
    vi.useRealTimers();
  });

  it("opens the intro video", () => {
    render(<CardPage />);
    fireEvent.click(screen.getByRole("button", { name: /watch my intro/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /close video/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/no worries/i);
  });

  it("celebrates when the video finishes", () => {
    const { container } = render(<CardPage />);
    fireEvent.click(screen.getByRole("button", { name: /watch my intro/i }));
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    fireEvent.ended(video as HTMLVideoElement);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/thanks for watching/i);
  });

  it("toggles the background music", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    render(<CardPage />);

    const toggle = screen.getByRole("button", { name: /play music/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /pause music/i })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /pause music/i }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /play music/i })).toBeInTheDocument();
  });

  it("switches between the three tunes", () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    render(<CardPage />);

    fireEvent.click(screen.getByRole("button", { name: /play music/i }));
    expect(screen.getByText(/builder/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next tune/i }));
    expect(screen.getByText(/pune evenings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next tune/i }));
    expect(screen.getByText(/neural drift/i)).toBeInTheDocument();
  });

  it("speaks the greetings aloud when asked, in a voice for each language", () => {
    vi.useFakeTimers();
    const speak = vi.fn();
    const hindiVoice = { lang: "hi-IN", name: "Hindi" };
    vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn(), getVoices: () => [hindiVoice] });
    class FakeUtterance {
      text: string;
      voice: unknown;
      lang = "";
      rate = 1;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    render(<CardPage />);

    fireEvent.click(screen.getByRole("button", { name: /speak greetings aloud/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(speak).not.toHaveBeenCalled(); // English has no voice on this fake device, so it stays silent

    act(() => {
      vi.advanceTimersByTime(2400);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(speak).toHaveBeenCalledTimes(1); // Hindi greeting
    expect(speak.mock.calls[0][0].text).toBe("नमस्ते");
    vi.unstubAllGlobals();
  });

  it("opens the share card and the contact form", () => {
    render(<CardPage />);
    fireEvent.click(screen.getByRole("button", { name: /share my card/i }));
    expect(screen.getByRole("dialog", { name: /share vannsh's card/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close share/i }));
    fireEvent.click(screen.getByRole("button", { name: /leave your details/i }));
    expect(screen.getByRole("dialog", { name: /leave your details/i })).toBeInTheDocument();
  });
});
