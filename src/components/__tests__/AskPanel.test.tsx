import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AskPanel from "../AskPanel";
import AskLauncher from "../AskLauncher";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function ask(question: string) {
  fireEvent.change(screen.getByLabelText(/ask a question/i), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: /send question/i }));
  vi.advanceTimersByTime(1500);
}

describe("AskPanel", () => {
  it("answers from the portfolio and resume", () => {
    render(<AskPanel onClose={() => undefined} />);
    ask("What certifications do you have?");
    expect(screen.getByText(/I've completed 16 certifications/)).toBeInTheDocument();
  });

  it("offers links with an answer", () => {
    render(<AskPanel onClose={() => undefined} />);
    ask("How can I contact you?");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
  });

  it("politely refuses questions outside the portfolio", () => {
    render(<AskPanel onClose={() => undefined} />);
    ask("What's the capital of France?");
    expect(screen.getByText(/outside what I know/i)).toBeInTheDocument();
  });

  it("answers a suggestion chip when tapped", () => {
    render(<AskPanel onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "What are your skills?" }));
    vi.advanceTimersByTime(1500);
    expect(screen.getByText(/core strengths/i)).toBeInTheDocument();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<AskPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("AskLauncher", () => {
  it("opens and closes the chat", () => {
    render(<AskLauncher />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /ask me/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
