from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.models import HealthResponse

app = FastAPI()

_dist = Path(__file__).parent.parent / "dist"


@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")


if (_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(_dist / "assets")), name="assets")


@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str = ""):
    index = _dist / "index.html"
    if index.exists():
        return HTMLResponse(content=index.read_text())
    return HTMLResponse(
        content="<!DOCTYPE html><html><head></head><body><div id='root'></div></body></html>"
    )
