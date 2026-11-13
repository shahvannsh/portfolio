import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LeadForm from "../LeadForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

function fill(name = "Asha", email = "asha@example.com") {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/your email/i), { target: { value: email } });
}

describe("LeadForm", () => {
  it("sends the details and thanks the visitor", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const onSent = vi.fn();
    render(<LeadForm onClose={() => undefined} onSent={onSent} />);

    fill();
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: "ML internship" } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/thanks, asha/i));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/lead");
    expect(JSON.parse(options.body)).toMatchObject({ name: "Asha", email: "asha@example.com", message: "ML internship", company: "" });
    expect(onSent).toHaveBeenCalled();
  });

  it("offers email and WhatsApp when sending fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 501 }));
    render(<LeadForm onClose={() => undefined} />);

    fill();
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/didn't go through/i);
    expect(screen.getByRole("link", { name: /email me/i })).toHaveAttribute("href", expect.stringContaining("mailto:"));
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", expect.stringContaining("wa.me"));
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<LeadForm onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close form/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
