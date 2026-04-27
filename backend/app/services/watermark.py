import os
from typing import Optional
import cv2
from .video_utils import bits_to_bytes, get_video_writer, read_lsb_bits, str_to_bits, write_lsb_bits


def embed_watermark(input_video_path: str, output_video_path: str, watermark_id: str) -> str:
    os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
    cap, writer = get_video_writer(input_video_path, output_video_path)
    bits = str_to_bits(watermark_id)
    wrote_first = False
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break
        if not wrote_first:
            frame = write_lsb_bits(frame, bits)
            wrote_first = True
        writer.write(frame)
    cap.release()
    writer.release()
    return output_video_path


def detect_watermark(video_path: str) -> Optional[str]:
    cap = cv2.VideoCapture(video_path)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        return None
    header_bits = read_lsb_bits(frame, 16)
    header_bytes = bits_to_bytes(header_bits)
    if len(header_bytes) < 2:
        return None
    length = int.from_bytes(header_bytes[:2], "big")
    if length <= 0 or length > 200:
        return None
    data_bits = read_lsb_bits(frame, 16 + (length * 8))[16:]
    data = bits_to_bytes(data_bits)
    if len(data) < length:
        return None
    try:
        return data[:length].decode("utf-8")
    except UnicodeDecodeError:
        return None
