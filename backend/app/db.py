import os
from pathlib import Path
from urllib.parse import urlparse
from pymongo import MongoClient
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

MONGO_URI = os.getenv("MONGO_URI")  
MONGO_DB_ENV = os.getenv("MONGO_DB")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is required in backend/.env or environment")


def resolve_db_name(uri: str, db_name_env: str | None) -> str:
    if db_name_env:
        return db_name_env
    parsed = urlparse(uri)
    path_db = parsed.path.lstrip("/")
    return path_db if path_db else "sports_protectionokays"


MONGO_DB = resolve_db_name(MONGO_URI, MONGO_DB_ENV)

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
db = client[MONGO_DB]   


def ping_db() -> None:  
    client.admin.command("ping")

authorities_col = db["authorities"]
official_media_col = db["official_media"]
whitelist_col = db["whitelist"]
detections_col = db["detections"]
incoming_media_col = db["incoming_media"]
