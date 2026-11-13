import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ShareCard, { SHARE_URL } from "../ShareCard";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ShareCard", () => {
  it("shows the QR code and copies the link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<ShareCard onClose={() => undefined} />);

    expect(screen.getByAltText(/qr code/i)).toHaveAttribute("src", "/card-qr.svg");
    fireEvent.click(screen.getByRole("button", { name: /copy link/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/link copied/i));
    expect(writeText).toHaveBeenCalledWith(SHARE_URL);
  });

  it("uses the share sheet when the device has one", () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share });
    render(<ShareCard onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: SHARE_URL }));
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<ShareCard onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close share/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
