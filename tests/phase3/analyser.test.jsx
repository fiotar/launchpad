import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../frontend/App";

beforeEach(() => {
  // Provide a fake token so the analyser section is unlocked
  localStorage.setItem("terrascope_token", "fake-test-token");

  // Default mock: waitlist count + risk-map both resolve OK
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: 0 }),
  });
});

describe("Phase 3: Site Analyser", () => {
  it("has a section with id 'analyser'", () => {
    const { container } = render(<App />);
    expect(container.querySelector("section#analyser")).not.toBeNull();
  });

  it("has a location input", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Phoenix, AZ/i)).toBeInTheDocument();
  });

  it("has a size dropdown", () => {
    render(<App />);
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(2); // waitlist + analyser
  });

  it("has an Analyse Site button", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /analyse site/i })
    ).toBeInTheDocument();
  });

  it("shows results after successful analysis", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ count: 0 }) }); // waitlist count
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) }); // risk-map
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        location: "Phoenix, AZ",
        size: "large",
        scores: { water: 96, energy: 60, community: 48 },
        verdict: "HIGH RISK",
        flags: ["Severe water stress"],
        alternatives: [
          {
            location: "Des Moines, IA",
            scores: { water: 26, energy: 29, community: 22 },
            verdict: "SAFE TO BUILD",
            reason: "Excellent water supply",
          },
        ],
      }),
    });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Phoenix, AZ/i), {
      target: { value: "Phoenix, AZ" },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyse site/i }));

    await waitFor(() => {
      expect(screen.getByText(/HIGH RISK/i)).toBeInTheDocument();
    });
  });

  it("shows alternatives when site is high risk", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ count: 0 }) }); // waitlist count
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) }); // risk-map
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        location: "Phoenix, AZ",
        size: "large",
        scores: { water: 96, energy: 60, community: 48 },
        verdict: "HIGH RISK",
        flags: ["Severe water stress"],
        alternatives: [
          {
            location: "Des Moines, IA",
            scores: { water: 26, energy: 29, community: 22 },
            verdict: "SAFE TO BUILD",
            reason: "Excellent water supply",
          },
        ],
      }),
    });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Phoenix, AZ/i), {
      target: { value: "Phoenix, AZ" },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyse site/i }));

    await waitFor(() => {
      expect(screen.getByText(/Des Moines, IA/i)).toBeInTheDocument();
    });
  });

  it("shows not found message for unknown location", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ count: 0 }) }); // waitlist count
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) }); // risk-map
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Location 'Atlantis, XX' not found." }),
    });

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Phoenix, AZ/i), {
      target: { value: "Atlantis, XX" },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyse site/i }));

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
