import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TalkingMascot from "../TalkingMascot";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TalkingMascot", () => {
  it("opens the intro video and closes it again", () => {
    const { container } = render(<TalkingMascot />);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /watch my intro/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(container.querySelector("video")?.getAttribute("src")).toBe("/intro.mp4");

    fireEvent.click(screen.getByRole("button", { name: /close video/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("plays and pauses the Builder track", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    render(<TalkingMascot />);

    fireEvent.click(screen.getByRole("button", { name: /play music/i }));
    expect(play).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /pause music/i }));
    expect(pause).toHaveBeenCalled();
  });
});
