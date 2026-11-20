import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AskPanel from "../AskPanel";
import AskLauncher from "../AskLauncher";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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

  it("offers WhatsApp and email links for booking a call", () => {
    render(<AskPanel onClose={() => undefined} />);
    ask("Can I book a call with you?");
    expect(screen.getByRole("link", { name: "WhatsApp me" })).toHaveAttribute("href", expect.stringContaining("wa.me"));
    expect(screen.getByRole("link", { name: "Email me" })).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });

  it("asks the AI endpoint only when the built-in answers don't know and it's switched on", async () => {
    vi.stubEnv("VITE_AI_CHAT", "true");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ answer: "I built Chotu myself.", refused: false }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<AskPanel onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText(/ask a question/i), { target: { value: "What's the capital of France?" } });
    fireEvent.click(screen.getByRole("button", { name: /send question/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(1500);
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.objectContaining({ method: "POST" }));
    expect(screen.getByText("I built Chotu myself.")).toBeInTheDocument();
  });

  it("falls back to the built-in refusal when the AI endpoint fails", async () => {
    vi.stubEnv("VITE_AI_CHAT", "true");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    render(<AskPanel onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText(/ask a question/i), { target: { value: "Write me a poem" } });
    fireEvent.click(screen.getByRole("button", { name: /send question/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText(/outside what I know/i)).toBeInTheDocument();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<AskPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = "";
  continuous = true;
  interimResults = false;
  maxAlternatives = 0;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  constructor() {
    FakeRecognition.instances.push(this);
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onend?.();
  }
  abort() {}
  emitFinal(text: string) {
    this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });
    this.onend?.(); // real browsers end the session right after the final result
  }
}

function installSpeech() {
  const spoken: { text: string; onend: (() => void) | null }[] = [];
  const cancel = vi.fn();
  vi.stubGlobal("speechSynthesis", {
    speak: (u: (typeof spoken)[number]) => spoken.push(u),
    cancel,
    getVoices: () => [{ name: "Veena", lang: "en-IN" }],
    speaking: false,
    pending: false,
  });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      text: string;
      voice: unknown;
      lang = "";
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  return { spoken, cancel };
}

describe("AskPanel by voice", () => {
  it("hides the mic when the browser can't do speech recognition", () => {
    render(<AskPanel onClose={() => undefined} />);
    expect(screen.queryByRole("button", { name: /talk to me/i })).toBeNull();
  });

  it("lets you ask by voice, answers aloud, then listens for the next question", async () => {
    FakeRecognition.instances = [];
    vi.stubGlobal("webkitSpeechRecognition", FakeRecognition);
    const { spoken } = installSpeech();
    render(<AskPanel onClose={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: /talk to me/i }));
    expect(FakeRecognition.instances).toHaveLength(1);
    expect(screen.getByRole("button", { name: /stop listening/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/listening/i);

    act(() => FakeRecognition.instances[0].emitFinal("What are your skills?"));
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText("What are your skills?")).toBeInTheDocument();
    expect(screen.getByText(/core strengths/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toMatch(/core strengths/i);

    act(() => spoken[0].onend?.()); // finished speaking, so it listens again
    expect(FakeRecognition.instances).toHaveLength(2);
  });

  it("stops listening and talking when you tap stop", () => {
    FakeRecognition.instances = [];
    vi.stubGlobal("webkitSpeechRecognition", FakeRecognition);
    const { cancel } = installSpeech();
    render(<AskPanel onClose={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: /talk to me/i }));
    fireEvent.click(screen.getByRole("button", { name: /stop listening/i }));
    expect(screen.getByRole("button", { name: /talk to me/i })).toBeInTheDocument();
    expect(cancel).toHaveBeenCalled();
    expect(FakeRecognition.instances).toHaveLength(1); // it does not start again by itself
  });

  it("can turn spoken replies on and off", () => {
    installSpeech();
    render(<AskPanel onClose={() => undefined} />);
    const toggle = screen.getByRole("button", { name: /speak replies aloud/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
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
