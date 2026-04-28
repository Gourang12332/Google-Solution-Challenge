# Sports Media Protection MVP

## Backend

Requirements:
- Python 3.10+
- MongoDB running locally or via `MONGO_URI`

Run:
1. `cd backend`
2. `python -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --port 8000`

Environment variables:
- `MONGO_URI` (example `mongodb+srv://user:pass@cluster.mongodb.net/sports_protection?retryWrites=true&w=majority`)
- `MONGO_DB` (optional override, otherwise DB is inferred from `MONGO_URI` path, fallback `sports_protection`)
- `OFFICIAL_STORAGE_DIR` (default `backend/storage/official`)
- `INCOMING_STORAGE_DIR` (default `backend/storage/incoming`)
- `WORKER_POLL_SECONDS` (default `5`)

Core APIs:
- `POST /upload_official` (multipart: `video`, `authority_id`, `title`)
- `GET /authorities`
- `GET /media?authority_id=...`
- `POST /ingest`
- `GET /detections/{media_id}`
- `GET /summary/{media_id}`
- `GET /health/db`

## Frontend

Run:
1. `cd frontend`
2. `npm install`
3. `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev`

Pages:
- `/` dashboard with authority selector and media listing
- `/media/[mediaId]` detail with summary, leakage, timeline, propagation graph

## Submission Prototype UI

A standalone prototype is available in `prototype-ui/` to present the complete end-to-end system flow as a shareable demo link.

Run locally:
1. `cd prototype-ui`
2. Open `index.html` in browser
