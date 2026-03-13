# Phase 2: Waiting List

Add a signup form so visitors can join your waiting list. This is your first real backend feature.

## Form Component

- A section below the features with a clear heading (e.g. "Get Early Access")
- Form with:
  - **Email** input (required, must be valid email) with a label
  - **Name** input (optional) with a label
  - Submit button
- Client-side validation: show inline error for invalid email
- On successful submission: hide the form and show a thank-you message
- On server error: display the error message to the user
- Use Tailwind for styling — match the look and feel of the rest of the page

## Backend

- Pydantic models in `backend/models.py`:
  - `WaitlistRequest`: email (required, valid email), name (optional)
  - `WaitlistResponse`: success (bool), message (str)
- `POST /api/waitlist` endpoint in `backend/server.py`:
  - Validates input via Pydantic
  - Stores signups in memory (a list is fine)
  - Returns `{ "success": true, "message": "You're on the list!" }`
  - Returns 422 for invalid data (FastAPI handles this automatically)
- `GET /api/waitlist/count` endpoint:
  - Returns `{ "count": <number> }` — useful for social proof on the page

## Submit Flow

1. User fills in email (and optionally name)
2. Client validates email format before sending
3. Submit button shows loading state (disabled, text changes)
4. `fetch` POST to `/api/waitlist` with JSON body
5. On success: form disappears, thank-you message appears
6. On error: form stays visible, error message shown
