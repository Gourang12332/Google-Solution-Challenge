from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AuthorityOut(BaseModel):
    authority_id: str
    name: str


class AuthorityCreate(BaseModel):
    authority_id: str
    name: str


class FrameHash(BaseModel):
    frame_no: int
    phash: str


class OfficialMediaOut(BaseModel):
    media_id: str
    authority_id: str
    title: str
    uploaded_at: datetime
    watermark_id: str
    frames: List[FrameHash]


class IngestSourceSnippet(BaseModel):
    publishedAt: Optional[str] = None
    channelId: Optional[str] = None
    channelTitle: Optional[str] = None
    title: Optional[str] = None


class IngestRequest(BaseModel):
    video_id: str
    platform: str
    video_url: str
    snippet: IngestSourceSnippet
    views: int = Field(default=0, ge=0)


class DetectionOut(BaseModel):
    detection_id: str
    media_id: str
    source: Dict[str, Any]
    timestamp: datetime
    match_score: float
    detection_type: str
    status: str
    views: int


class SummaryOut(BaseModel):
    total_leakage: int
    total_detections: int
    first_detected_at: Optional[datetime] = None
