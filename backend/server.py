import os
import sqlite3
import time
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from backend.models import (
    HealthResponse,
    WaitlistRequest,
    WaitlistResponse,
    WaitlistCount,
    AnalyseRequest,
    AnalyseResponse,
)
from backend.analyser import analyse_site

app = FastAPI()

# ── CORS ────────────────────────────────────────────────────────────────────
_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DATABASE ─────────────────────────────────────────────────────────────────
_db_path = Path(__file__).parent.parent / "waitlist.db"


def get_db():
    conn = sqlite3.connect(str(_db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS signups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                interest TEXT,
                signed_up_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        conn.commit()


init_db()

# ── RATE LIMITING ─────────────────────────────────────────────────────────────
_rate_limit: dict[str, list[float]] = defaultdict(list)
_RATE_LIMIT_MAX = 5
_RATE_LIMIT_WINDOW = 60  # seconds


def check_rate_limit(ip: str):
    now = time.time()
    timestamps = _rate_limit[ip]
    # Remove timestamps older than the window
    _rate_limit[ip] = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW]
    if len(_rate_limit[ip]) >= _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Try again in a minute.",
        )
    _rate_limit[ip].append(now)


# ── HEALTH ───────────────────────────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")


# ── WAITLIST ─────────────────────────────────────────────────────────────────
@app.post("/api/waitlist", response_model=WaitlistResponse, status_code=201)
async def join_waitlist(body: WaitlistRequest, request: Request):
    check_rate_limit(request.client.host)

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO signups (email, name, interest) VALUES (?, ?, ?)",
                (body.email, body.name, body.interest),
            )
            conn.commit()
            position = conn.execute("SELECT COUNT(*) FROM signups").fetchone()[0]
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="You're already on the list!",
        )

    return WaitlistResponse(
        success=True,
        message="You're on the list!",
        position=position,
    )


@app.get("/api/waitlist/count", response_model=WaitlistCount)
async def get_count():
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM signups").fetchone()[0]
    return WaitlistCount(count=count)


@app.get("/api/waitlist/export")
async def export_waitlist(x_api_key: str = Header(default=None)):
    expected_key = os.environ.get("ADMIN_API_KEY", "")
    if not expected_key or x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    with get_db() as conn:
        rows = conn.execute(
            "SELECT name, email, interest, signed_up_at FROM signups ORDER BY id"
        ).fetchall()
    return [dict(row) for row in rows]


# ── ANALYSER ─────────────────────────────────────────────────────────────────
@app.post("/api/analyse", response_model=AnalyseResponse)
async def analyse(body: AnalyseRequest):
    try:
        result = analyse_site(body.location, body.size.value)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{body.location}' not found. Try a US city like 'Phoenix, AZ' or 'Des Moines, IA'.",
        )
    return result


# ── SPA FALLBACK ─────────────────────────────────────────────────────────────
_dist = Path(__file__).parent.parent / "dist"

if (_dist / "assets").exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/assets", StaticFiles(directory=str(_dist / "assets")), name="assets")


@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str = ""):
    index = _dist / "index.html"
    if index.exists():
        return HTMLResponse(content=index.read_text())
    return HTMLResponse(
        content="<!DOCTYPE html><html><head></head><body><div id='root'></div></body></html>"
    )
