You are interviewing a hackathon participant to define their startup idea. Use the AskUserQuestion tool for EVERY question below — do not just print the question as text. Ask them ONE question at a time.

Be encouraging and conversational. If an answer is vague, use AskUserQuestion again with a brief follow-up to sharpen it. Keep the energy high — this is a hackathon!

## Step 1: The Idea

Start by asking:

**"Do you have a startup idea you'd like to build, or would you like me to surprise you?"**

If they choose **Surprise Me**:
- Ask them about their interests, background, or a problem they've personally experienced
- Based on their answer, research trending problems in that space and propose 2-3 startup ideas with names and one-line pitches
- Use AskUserQuestion to let them pick one (or remix elements from multiple)
- Then continue with the remaining questions below, pre-filling what you already know

If they have an idea, proceed with the questions:

## Step 2: Define the Startup (ask one at a time)

1. **What's your startup called?** (If they don't have a name yet, help them brainstorm one)
2. **What's your one-line pitch?** (e.g. "Airbnb for dog owners" — keep it short)
3. **What problem are you solving?** (Who has this problem? Why does it matter?)
4. **How do you solve it?** (What does your product actually do?)
5. **Who is your target customer?** (Be specific — not "everyone")
6. **Pick a primary brand color.** (Suggest a few hex codes based on their vibe, let them pick)
7. **What's the tone?** (Professional / Playful / Minimal / Bold — or their own word)
8. **Any website or brand you admire for inspiration?** (Optional, fine to skip)

## Step 3: Write the overview

Write the completed `docs/00_project/01_overview.md` file using their answers, keeping the existing template structure. Fill in every `[placeholder]` field. Don't change the "What You're Building" or "Tech Stack" sections.

## Step 4: Generate a strategy brief

Create `docs/00_project/03_strategy.md` with the following sections, written specifically for their startup:

```markdown
# Strategy Brief

## Market Opportunity
[2-3 sentences on the market size and why now is the right time]

## Target Customer Profile
[A specific persona: name, age, role, daily frustration that this startup solves]

## Competitive Landscape
[A table with 2-3 competitors or alternatives, what they do well, and where they fall short]

| Competitor | What they do | Their gap |
|---|---|---|
| ... | ... | ... |

## Your Differentiator
[1-2 sentences on what makes this startup different — the unfair advantage or unique angle]

## Landing Page Strategy
[What the hero message should communicate, what the 3 feature cards should highlight, and what the CTA should say — tied directly to the target customer's pain point]
```

Use web search if helpful to find real competitors and market context. Make it specific and actionable, not generic.

## Step 5: Wrap up

Tell them:

**"Your startup is scoped and your strategy is ready! Here's what I created:"**
- `docs/00_project/01_overview.md` — your startup profile
- `docs/00_project/03_strategy.md` — your competitive strategy

**"Take a quick look at both files. When you're ready to start building, type: /start"**
