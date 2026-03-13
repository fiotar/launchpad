# ESMT Berlin — AI-Native Startup Builder

**Build a real startup landing page in 3 hours using Claude Code.**

No prior coding experience required. Your AI pair programmer handles the implementation — you handle the product decisions.

---

## Quick Setup (Do This Before the Hackathon)

### 1. Install Prerequisites

**macOS:**
```bash
brew install node python3
```

**Windows:**
```bash
# Install Node.js from https://nodejs.org (LTS)
# Install Python from https://python.org (3.10+)
# Use WSL or Git Bash as your terminal
```

**Linux:**
```bash
sudo apt-get install -y nodejs npm python3 python3-pip python3-venv
```

### 2. Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### 3. Set Up Your API Key
```bash
cp .env.example .env
```
Open `.env` in a text editor and paste your Anthropic API key. You can get one at [console.anthropic.com](https://console.anthropic.com/). If your project uses OpenAI, uncomment and fill in `OPENAI_API_KEY` as well.

### 4. Verify Everything Works
```bash
node --version     # Should be 18+
python3 --version  # Should be 3.10+
claude --version   # Should print a version number
```

---

## Hackathon Day

```bash
# 1. Clone this repo
git clone <repo-url>
cd launchpad

# 2. Install everything (Python venv + deps + Node deps)
npm run setup

# 3. Initialize git
git init && git add -A && git commit -m "initial: starting hackathon"

# 4. Launch Claude Code
claude

# 5. Define your startup idea:
/interview

# 6. Start building:
/start
```

---

## How This Works

### Your Progress

| Phase | What You Build |
|-------|---------------|
| Idea | `/interview` defines your startup and generates a strategy brief |
| Landing Page | React + Tailwind hero + features — tests pre-written, just make them pass |
| Waiting List | Signup form + backend API — you write the tests |
| Beyond | Finished early? Start building the actual product. |

### The Workflow

1. **Read the spec** — Claude reads the spec in `docs/`
2. **Write a failing test** — Tell Claude: "Write a failing test for [requirement]"
3. **Make it pass** — Tell Claude: "Make this test pass with minimal code"
4. **Commit** — Claude commits after each green test
5. **Repeat**

---

## Claude Code Commands

Type these inside Claude Code:

| Command | What it does |
|---------|-------------|
| `/interview` | Define your startup idea + generate a strategy brief |
| `/strategy` | Review and edit your strategy conversationally |
| `/start` | Start building (reads the spec, runs tests) |

## Terminal Commands

```bash
npm run setup         # Install everything (first time only)
npm run dev           # Start frontend + backend together
npm test              # Run ALL tests (Python + JavaScript)
npm run test:py       # Python tests only (pytest)
npm run test:js       # JavaScript tests only (vitest)
npm run build         # Build frontend for production
git log --oneline     # See your commit history
```

Visit `http://localhost:5173` for the frontend and `http://localhost:3004/docs` for the API documentation.

---

## Tips

- **Run `/interview` first.** It defines your startup and generates a strategy brief.
- **Work in order.** Landing page first, then waiting list.
- **One test at a time.** Don't ask Claude to write 5 tests at once.
- **Check your API docs.** `localhost:3004/docs` lets you test endpoints in the browser.
- **If you're stuck:** Ask Claude "What should I do next?"

---

## Demo Time

At the end, you'll show:
1. Your landing page in the browser
2. The waiting list working end-to-end
3. Your FastAPI docs at `/docs`
4. Your `git log` — proof you built it step by step
5. Your test results — proof it actually works
