import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
