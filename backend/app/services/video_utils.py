import os
import uuid
from typing import List, Tuple
import cv2
import numpy as np
from PIL import Image
import imagehash
import httpx


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def extract_frame_hashes(video_path: str, max_frames: int = 20, sample_step: int = 30) -> List[dict]:
    cap = cv2.VideoCapture(video_path)
    frames: List[dict] = []
    idx = 0
    used = 0
    while cap.isOpened() and used < max_frames:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % sample_step == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(rgb)
            ph = str(imagehash.phash(pil))
            frames.append({"frame_no": idx, "phash": ph})
            used += 1
        idx += 1
    cap.release()
    return frames


def download_video(video_url: str, target_dir: str = "/tmp") -> str:
    ensure_dir(target_dir)

    if video_url.startswith("file://"):
        return video_url.replace("file://", "", 1)

    if os.path.exists(video_url):
        return video_url

    ext = os.path.splitext(video_url.split("?")[0])[1] or ".mp4"
    out_path = os.path.join(target_dir, f"{uuid.uuid4().hex}{ext}")

    with httpx.stream("GET", video_url, follow_redirects=True, timeout=120.0) as resp:
        resp.raise_for_status()
        with open(out_path, "wb") as f:
            for chunk in resp.iter_bytes(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    return out_path


def get_video_writer(input_path: str, output_path: str) -> Tuple[cv2.VideoCapture, cv2.VideoWriter]:
    cap = cv2.VideoCapture(input_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 24.0
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    return cap, writer


def str_to_bits(text: str) -> List[int]:
    payload = text.encode("utf-8")
    length = len(payload)
    raw = length.to_bytes(2, "big") + payload
    bits: List[int] = []
    for b in raw:
        for shift in range(7, -1, -1):
            bits.append((b >> shift) & 1)
    return bits


def bits_to_bytes(bits: List[int]) -> bytes:
    out = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for bit in bits[i : i + 8]:
            byte = (byte << 1) | bit
        out.append(byte)
    return bytes(out)


def write_lsb_bits(frame: np.ndarray, bits: List[int]) -> np.ndarray:
    flat = frame.reshape(-1)
    n = min(len(bits), len(flat))
    for i in range(n):
        flat[i] = (flat[i] & 0xFE) | bits[i]
    return flat.reshape(frame.shape)


def read_lsb_bits(frame: np.ndarray, total_bits: int) -> List[int]:
    flat = frame.reshape(-1)
    n = min(total_bits, len(flat))
    return [int(flat[i] & 1) for i in range(n)]
