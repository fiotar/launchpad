# Project Overview

## Your Startup

**Startup Name**: Terrascope
**Tagline**: The location intelligence layer for data centre developers
**Problem**: Data centre developers lose millions — and years — when projects get cancelled due to water/cooling constraints, energy grid limitations, and community/political resistance. These are risks that could have been identified before committing capital, but today's tools don't surface them early enough.
**Solution**: An AI-powered platform that scores any candidate location against three critical risk dimensions — water resource availability, energy grid capacity, and community/political risk — so developers can screen dozens of sites in hours, not months, before a single dollar is committed.
**Target Customer**: Real estate developers specialising in data centres who invest significant capital and time into development projects and face project cancellation risk from planning failures and resource constraints.

## What You're Building

A landing page for your startup with:
1. A hero section that communicates your value proposition
2. A features/benefits section
3. A waiting list signup form that works (submits to a backend API)
4. A thank-you response after submission

This is a real, deployable website — not a mockup.

## Design Direction

### Archetype

**Archetype**: Corporate
**Heading Font**: Inter
**Body Font**: Inter
**Mode**: Light
**Primary Color**: #1E3A5F
**Accent Color**: #38BDF8
**Border Radius**: soft (rounded-lg)
**Shadow Style**: subtle (shadow-sm)

### Inspiration

**Reference site**: None specified
**Design traits to borrow**:
- Color palette: Navy slate hero with white text, sky blue accents for highlights and CTAs
- Typography: Bold Inter headlines (font-bold), lighter body text (font-normal), strong size contrast
- Layout: Full-bleed hero, alternating white/gray-50 sections, generous whitespace
- Visual style: Subtle shadows, rounded-lg cards, clean data-forward aesthetic
- CTA style: Sky blue accent buttons, rounded-lg, high contrast on navy backgrounds

## Tech Stack (Fixed)

- React + Tailwind CSS frontend (via Vite)
- Python + FastAPI backend
- pytest for API tests, Vitest + React Testing Library for frontend tests
- Auto-generated API docs at `/docs`
