import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../frontend/App";

// Mock fetch globally — default returns count=0
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: 0 }),
  });
});

describe("Phase 2: Waitlist Form", () => {
  it("has a section with id 'waitlist'", () => {
    const { container } = render(<App />);
    expect(container.querySelector("section#waitlist")).not.toBeNull();
  });

  it("has an email input", () => {
    render(<App />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("has a name input", () => {
    render(<App />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("has an interest dropdown", () => {
    render(<App />);
    expect(screen.getByLabelText(/what excites you most/i)).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /join waitlist/i })
    ).toBeInTheDocument();
  });

  it("shows an error for invalid email on submit", async () => {
    render(<App />);
    const submitBtn = screen.getByRole("button", { name: /join waitlist/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("shows success message after valid submission", async () => {
    // First call: count on mount, second call: submit
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ count: 10 }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "You're on the list!", position: 5 }),
      });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText(/#5/i)).toBeInTheDocument();
    });
  });

  it("shows already-on-list message for duplicate email", async () => {
    // First call: count on mount, second call: submit returns 409
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ count: 10 }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ detail: "You're already on the list!" }),
      });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "dupe@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText(/already/i)).toBeInTheDocument();
    });
  });
});
