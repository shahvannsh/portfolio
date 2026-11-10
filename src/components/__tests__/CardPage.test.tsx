import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CardPage from "../CardPage";

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
    expect(screen.getByRole("status")).toHaveTextContent(/good (morning|afternoon|evening)!.*watch my intro/i);
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
});
