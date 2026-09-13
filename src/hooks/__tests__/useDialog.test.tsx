import { describe, it, expect, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useDialog } from "../useDialog";

function TestDialog({ onCloseSpy }: { onCloseSpy: () => void }) {
  const [open, setOpen] = useState(false);
  const inputRef = useDialog<HTMLInputElement>(open, () => {
    onCloseSpy();
    setOpen(false);
  });

  return (
    <div>
      <button data-testid="trigger" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && <input data-testid="dialog-input" ref={inputRef} />}
    </div>
  );
}

function pressEscape() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
}

describe("useDialog", () => {
  it("moves focus to the target element when opened", async () => {
    const onCloseSpy = vi.fn();
    const { getByTestId } = render(<TestDialog onCloseSpy={onCloseSpy} />);

    act(() => {
      getByTestId("trigger").click();
    });

    await waitFor(() => {
      expect(document.activeElement).toBe(getByTestId("dialog-input"));
    });
  });

  it("calls onClose when Escape is pressed while open", async () => {
    const onCloseSpy = vi.fn();
    const { getByTestId } = render(<TestDialog onCloseSpy={onCloseSpy} />);

    act(() => {
      getByTestId("trigger").click();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(getByTestId("dialog-input"));
    });

    act(() => {
      pressEscape();
    });

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it("restores focus to the previously-focused element after closing", async () => {
    const onCloseSpy = vi.fn();
    const { getByTestId } = render(<TestDialog onCloseSpy={onCloseSpy} />);
    const trigger = getByTestId("trigger");

    act(() => {
      trigger.focus();
      trigger.click();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(getByTestId("dialog-input"));
    });

    act(() => {
      pressEscape();
    });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("does not respond to Escape while closed", () => {
    const onCloseSpy = vi.fn();
    render(<TestDialog onCloseSpy={onCloseSpy} />);

    act(() => {
      pressEscape();
    });

    expect(onCloseSpy).not.toHaveBeenCalled();
  });
});
