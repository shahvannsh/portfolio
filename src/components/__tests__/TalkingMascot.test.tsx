import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TalkingMascot from "../TalkingMascot";

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
});
