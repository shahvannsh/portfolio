import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CardPage from "../CardPage";

afterEach(() => {
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
    expect(screen.getByRole("status")).toHaveTextContent(/(good (morning|afternoon|evening)|hello, night owl)!.*watch my intro/i);
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
});
