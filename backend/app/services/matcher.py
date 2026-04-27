from typing import Optional, Tuple
from app.db import official_media_col
from .fingerprint import compare_frame_sets


def find_best_official_match(candidate_frames: list, ratio_threshold: float = 0.4) -> Tuple[Optional[dict], float]:
    best_doc = None
    best_score = 0.0
    cursor = official_media_col.find({}, {"_id": 0})
    for doc in cursor:
        score, _, ratio = compare_frame_sets(candidate_frames, doc.get("frames", []))
        if ratio >= ratio_threshold and score > best_score:
            best_score = score
            best_doc = doc
    return best_doc, best_score
