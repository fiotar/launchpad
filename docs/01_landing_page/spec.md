# Phase 1: Landing Page

Get the server running and build a landing page that communicates your startup's value proposition.

## Server Setup

- FastAPI app in `backend/server.py` (the `app` object must be importable)
- Health endpoint: `GET /api/health` returns `{ "status": "ok" }`
- Pydantic `HealthResponse` model in `backend/models.py`
- Server runs on port 3004 via `npm run dev:backend`

## React App

- Main component in `frontend/App.jsx`
- Must render `<header>`, `<main>`, and `<footer>` semantic elements
- Use Tailwind CSS classes for all styling — no custom CSS needed

## Hero Section

- Your startup name in an `<h1>` — large, bold, impossible to miss
- Tagline in a `<p>` — one sentence that communicates your value
- Call-to-action button that scrolls to the waiting list section
- Full-width section with generous padding and a distinct background

## Features Section

- Section with at least 3 feature cards
- Each card has a heading and paragraph
- Use the feature highlights from your strategy brief
- Grid layout: stacked on mobile, 3 columns on desktop

## Design

- Use your primary brand color from `docs/00_project/01_overview.md`
- Follow the design principles in `CLAUDE.md`
- Responsive: test at 375px (mobile) and 1024px+ (desktop)

## Pre-written Tests

Tests in `tests/phase1/` are already written. Make them all pass first, then continue building out the hero and features sections.
