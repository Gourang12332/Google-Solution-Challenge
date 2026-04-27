import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.db import (
    MONGO_DB,
    MONGO_URI,
    authorities_col,
    detections_col,
    incoming_media_col,
    official_media_col,
    ping_db,
)
from app.models import (
    AuthorityCreate,
    AuthorityOut,
    DetectionOut,
    IngestRequest,
    OfficialMediaOut,
    SummaryOut,
)
from app.services.video_utils import ensure_dir, extract_frame_hashes
from app.services.watermark import embed_watermark
from app.services.worker import process_one_pending


OFFICIAL_DIR = os.getenv("OFFICIAL_STORAGE_DIR", "backend/storage/official")
INCOMING_DIR = os.getenv("INCOMING_STORAGE_DIR", "backend/storage/incoming")
POLL_SECONDS = float(os.getenv("WORKER_POLL_SECONDS", "5"))

app = FastAPI(title="Sports Media Protection MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    ping_db()
    ensure_dir(OFFICIAL_DIR)
    ensure_dir(INCOMING_DIR)
    if authorities_col.count_documents({}) == 0:
        authorities_col.insert_many(
            [
                {"authority_id": "auth_nba", "name": "National Basketball Authority"},
                {"authority_id": "auth_fifa", "name": "Football Federation Authority"},
            ]
        )
    app.state.worker_task = asyncio.create_task(worker_loop())


@app.on_event("shutdown")
async def shutdown() -> None:
    task = getattr(app.state, "worker_task", None)
    if task:
        task.cancel()


async def worker_loop() -> None:
    while True:
        process_one_pending()
        await asyncio.sleep(POLL_SECONDS)


@app.post("/upload_official")
async def upload_official(
    authority_id: str = Form(...),
    title: str = Form(...),
    video: UploadFile = File(...),
):
    if not authorities_col.find_one({"authority_id": authority_id}):
        raise HTTPException(status_code=404, detail="Authority not found")
    media_id = uuid.uuid4().hex
    watermark_id = uuid.uuid4().hex
    original_path = os.path.join(OFFICIAL_DIR, f"{media_id}_orig.mp4")
    watermarked_path = os.path.join(OFFICIAL_DIR, f"{media_id}.mp4")
    with open(original_path, "wb") as f:
        f.write(await video.read())
    embed_watermark(original_path, watermarked_path, watermark_id)
    frames = extract_frame_hashes(watermarked_path, max_frames=20, sample_step=30)
    doc = {
        "media_id": media_id,
        "authority_id": authority_id,
        "title": title,
        "uploaded_at": datetime.now(timezone.utc),
        "watermark_id": watermark_id,
        "frames": frames,
    }
    official_media_col.insert_one(doc)
    return {"media_id": media_id, "watermark_id": watermark_id}


@app.get("/authorities", response_model=List[AuthorityOut])
async def list_authorities():
    return list(authorities_col.find({}, {"_id": 0})) 


@app.post("/authorities", response_model=AuthorityOut)
async def create_authority(payload: AuthorityCreate):
    if authorities_col.find_one({"authority_id": payload.authority_id}):
        raise HTTPException(status_code=409, detail="authority_id already exists")  
    doc = payload.model_dump()
    authorities_col.insert_one(doc)
    return doc


@app.get("/media", response_model=List[OfficialMediaOut])
async def list_media(authority_id: str):
    return list(official_media_col.find({"authority_id": authority_id}, {"_id": 0}))


@app.post("/ingest")
async def ingest(payload: IngestRequest):
    incoming_media_col.update_one(
        {"video_id": payload.video_id},
        {
            "$set": {
                "video_id": payload.video_id,
                "platform": payload.platform,
                "video_url": payload.video_url,
                "snippet": payload.snippet.model_dump(),
                "views": payload.views,
                "status": "pending",
            },
            "$setOnInsert": {"retry_count": 0},
        },
        upsert=True,
    )
    return {"ok": True, "video_id": payload.video_id}


@app.post("/ingest_upload")
async def ingest_upload(
    video_id: str = Form(...),
    platform: str = Form(...),
    channelId: str = Form(""),
    channelTitle: str = Form(""),
    title: str = Form(""),
    views: int = Form(0),
    video: UploadFile = File(...),
):
    ext = os.path.splitext(video.filename or "")[1] or ".mp4"
    local_path = os.path.join(INCOMING_DIR, f"{video_id}{ext}")
    with open(local_path, "wb") as f:
        f.write(await video.read())
    incoming_media_col.update_one(
        {"video_id": video_id},
        {
            "$set": {
                "video_id": video_id,
                "platform": platform,
                "video_url": local_path,
                "snippet": {
                    "channelId": channelId,
                    "channelTitle": channelTitle,
                    "title": title,
                    "publishedAt": datetime.now(timezone.utc).isoformat(),
                },
                "views": views,
                "status": "pending",
            },
            "$setOnInsert": {"retry_count": 0},
        },
        upsert=True,
    )
    return {"ok": True, "video_id": video_id, "stored_path": local_path}


@app.get("/detections/{media_id}", response_model=List[DetectionOut])
async def get_detections(media_id: str):
    return list(
        detections_col.find({"media_id": media_id}, {"_id": 0}).sort("timestamp", 1)
    )


@app.get("/summary/{media_id}", response_model=SummaryOut)
async def get_summary(media_id: str):
    items = list(detections_col.find({"media_id": media_id}, {"_id": 0}))
    if not items:
        return SummaryOut(total_leakage=0, total_detections=0, first_detected_at=None)
    total_leakage = sum(int(d.get("views", 0)) for d in items if d.get("status") == "unauthorized")
    total_detections = len(items)
    first_detected_at = min(d["timestamp"] for d in items)
    return SummaryOut(
        total_leakage=total_leakage,
        total_detections=total_detections,
        first_detected_at=first_detected_at,
    )


@app.get("/health/db")
async def health_db():
    ping_db()
    return {"ok": True, "mongo_uri_set": bool(MONGO_URI), "mongo_db": MONGO_DB}
