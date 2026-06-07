import os
import uuid
import tempfile
from datetime import datetime, timezone
from app.db import detections_col, incoming_media_col, official_media_col, whitelist_col
from .matcher import find_best_official_match
from .video_utils import download_video, extract_frame_hashes
from .watermark import detect_watermark


def uploader_from_snippet(doc: dict) -> str:
    snippet = doc.get("snippet") or {}
    return snippet.get("channelTitle") or snippet.get("channelId") or "unknown"


def check_authorization(authority_id: str, platform: str, uploader: str) -> str:
    wl = whitelist_col.find_one(
        {"authority_id": authority_id, "platform": platform},
        {"_id": 0},
    )
    if not wl:
        return "unauthorized"
    return "authorized" if uploader in wl.get("authorized_accounts", []) else "unauthorized"


def process_one_pending() -> None:
    pending = incoming_media_col.find_one_and_update(
        {"status": "pending"},
        {"$set": {"status": "processing", "error": None}},
        sort=[("retry_count", 1), ("video_id", 1)],
    )

    if not pending:
        return

    local_video_path = None

    try:
        local_video_path = download_video(pending["video_url"], tempfile.gettempdir())

        detection_type = None
        media_doc = None
        match_score = 0.0

        watermark_id = detect_watermark(local_video_path)

        if watermark_id:
            media_doc = official_media_col.find_one(
                {"watermark_id": watermark_id},
                {"_id": 0},
            )
            if media_doc:
                detection_type = "watermark"
                match_score = 1.0

        if not media_doc:
            frames = extract_frame_hashes(
                local_video_path,
                max_frames=20,
                sample_step=30,
            )
            media_doc, match_score = find_best_official_match(
                frames,
                ratio_threshold=0.4,
            )
            if media_doc:
                detection_type = "fingerprint"

        if media_doc and detection_type:
            uploader = uploader_from_snippet(pending)
            status = check_authorization(
                media_doc["authority_id"],
                pending["platform"],
                uploader,
            )

            detections_col.insert_one(
                {
                    "detection_id": uuid.uuid4().hex,
                    "media_id": media_doc["media_id"],
                    "source": {
                        "platform": pending["platform"],
                        "uploader": uploader,
                    },
                    "timestamp": datetime.now(timezone.utc),
                    "match_score": float(match_score),
                    "detection_type": detection_type,
                    "status": status,
                    "views": int(pending.get("views", 0)),
                }
            )

        incoming_media_col.update_one(
            {"video_id": pending["video_id"]},
            {
                "$set": {
                    "status": "processed",
                    "processed_at": datetime.now(timezone.utc),
                    "error": None,
                }
            },
        )

    except Exception as e:
        retry_count = int(pending.get("retry_count", 0)) + 1
        status = "failed" if retry_count >= 2 else "pending"

        incoming_media_col.update_one(
            {"video_id": pending["video_id"]},
            {
                "$set": {
                    "status": status,
                    "error": str(e),
                },
                "$inc": {"retry_count": 1},
            },
        )

    finally:
        if local_video_path:
            try:
                os.remove(local_video_path)
            except OSError:
                pass