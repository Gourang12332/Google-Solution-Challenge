from typing import List, Tuple


def hash_score(hash_a: str, hash_b: str) -> float:
    a = int(hash_a, 16)
    b = int(hash_b, 16)
    x = a ^ b
    distance = x.bit_count()
    return max(0.0, 1.0 - (distance / 64.0))


def compare_frame_sets(candidate_frames: List[dict], official_frames: List[dict], frame_threshold: float = 0.75) -> Tuple[float, int, int]:
    if not candidate_frames or not official_frames:
        return 0.0, 0, len(candidate_frames)
    matched = 0
    score_sum = 0.0
    for cf in candidate_frames:
        best = 0.0
        for of in official_frames:
            s = hash_score(cf["phash"], of["phash"])
            if s > best:
                best = s
        if best >= frame_threshold:
            matched += 1
        score_sum += best
    total = len(candidate_frames)
    ratio = matched / total if total else 0.0
    avg_score = score_sum / total if total else 0.0
    return avg_score, matched, ratio
