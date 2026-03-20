from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class HealthResponse(BaseModel):
    status: str


class WaitlistRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    interest: Optional[str] = None


class WaitlistResponse(BaseModel):
    success: bool
    message: str
    position: int


class WaitlistCount(BaseModel):
    count: int


# ── Analyser models ───────────────────────────────────────────────────────────

class DataCentreSize(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"


class AnalyseRequest(BaseModel):
    location: str
    size: DataCentreSize


class SiteScore(BaseModel):
    water: int
    energy: int
    community: int


class AlternativeSite(BaseModel):
    location: str
    scores: SiteScore
    verdict: str
    reason: str


class AnalyseResponse(BaseModel):
    location: str
    size: str
    scores: SiteScore
    verdict: str
    flags: list[str]
    alternatives: list[AlternativeSite]
