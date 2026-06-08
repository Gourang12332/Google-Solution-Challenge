# Sports Media Misappropriation Detection System

## What it does

Sports organizations invest heavily in producing live broadcasts, highlights, and digital media, but once that content is published, it becomes difficult to monitor how it is redistributed across the internet. Unauthorized uploads and rebroadcasts can reduce audience engagement on official platforms and dilute the value of licensed content.

This project detects potential unauthorized usage of official sports media by generating fingerprints from official videos and comparing them against externally discovered content. It also tracks how content spreads, estimates engagement leakage, and provides a dashboard for monitoring suspicious media activity.

---

## Why I built this

I have often seen official sports clips, highlights, and live streams appear on unofficial channels shortly after publication. While watching major tournaments and leagues, I noticed that content was frequently reposted across different platforms, making it difficult to determine where the original content was being distributed and how much engagement was being diverted away from official sources.

I wanted to build a system that could help organizations identify potentially unauthorized usage of their media, understand how it propagates across platforms, and estimate the impact of that redistribution. The smallest useful version of this idea is a system that can register official media, compare newly discovered content against it, and flag suspicious matches. This project implements that complete end-to-end workflow.

---

## How to run it

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

### Environment Variables

Create a `.env` file:

```env
MONGO_URI=<your_mongodb_uri>
MONGO_DB=Sports_officials
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your cloud api key>
CLOUDINARY_API_SECRET=<your secret key>
```

### Access

```text
Frontend: http://localhost:3000

Backend: http://localhost:8000
```

---

## Architecture decisions

### 1. Fingerprinting using perceptual hashes instead of storing raw frame comparisons

I chose perceptual hashing (pHash) because it provides a lightweight way to compare visually similar frames while remaining efficient enough for large numbers of comparisons. Comparing raw images directly would be significantly more expensive and difficult to scale.

### 2. Multi-frame analysis instead of single-frame matching

A single frame can generate false positives. The system extracts multiple frames from each video and determines similarity based on the percentage of matching frames, making detection more robust.

### 3. Internal normalization layer

Different platforms expose different metadata formats. I introduced a normalization layer that converts platform-specific responses into a common internal schema. This allows the downstream processing pipeline to remain platform-agnostic.

### 4. Queue-based processing instead of direct analysis

Incoming media is pushed into a queue before processing. This separates discovery from analysis and allows the system to scale horizontally by adding more workers without changing ingestion logic.

### 5. Propagation tracking through detections

Instead of storing only match results, every detection is recorded with timestamps and source information. This enables the system to reconstruct a propagation timeline and visualize how content spreads.

### 6. Engagement leakage estimation

Most detection systems stop at identifying misuse. I wanted to quantify impact, so the system aggregates views from unauthorized detections to estimate diverted engagement.

---

## What I used AI for

I used AI primarily as a development assistant.

AI-generated contributions:

* Initial architecture brainstorming
* API structure suggestions
* Database schema refinement
* System design reviews
* Documentation improvements

Written and implemented manually:

* Problem selection
* Product design decisions
* Data models
* Matching workflow design
* Ingestion pipeline design
* Propagation tracking concept
* Engagement leakage logic
* Backend implementation
* Frontend implementation

AI suggestions I overrode:

* Early suggestions focused on scanning the entire internet, which is unrealistic for an MVP. I instead implemented targeted platform ingestion and a queue-driven processing architecture.
* Some suggested storing all unmatched detections. I rejected this because the system only needs to retain media associated with registered official assets.
* Several suggestions emphasized thumbnail-only detection. I switched to full-video processing using multiple extracted frames for stronger matching accuracy.

---

## What I would change with 4 more weeks

If I were shipping this to real organizations, I would focus on production-scale ingestion and detection.

### Planned improvements

* Platform connectors using official APIs for multiple platforms
* Distributed processing workers
* Redis Streams and consumer groups
* Embedding-based similarity search in addition to pHash
* Vector database for large-scale fingerprint retrieval
* Real-time alerting system
* Admin authentication and organization onboarding
* Automated whitelist management
* Advanced propagation graph analysis
* Revenue-loss estimation models
* Monitoring, observability, and dead-letter queues
* Cloud deployment with autoscaling

The current version demonstrates the complete workflow end-to-end, while these improvements would make it suitable for large-scale production usage.

### Two layer Production Level product Improvements (optional) 
In the future, Jarvis AI Labs GPU credits could be used to add an embedding-based verification layer after the existing pHash filter, improving detection of heavily transformed videos without making every comparison GPU-dependent.

---

## Smallest Useful Version

The smallest useful version of this system consists of:

1. Register official media.
2. Generate fingerprints from official videos.
3. Ingest external media.
4. Compare external media against official content.
5. Flag suspicious matches.
6. Display detections and estimated engagement leakage.

This workflow is fully functional in the current implementation and demonstrates the core value of the system.
# If You want ready made credentials to check the flow, then they are : 
Authority id : Testing_123 || Authority_name : Tested || 
Deployed Link of the project : https://google-solution-challenge-umber.vercel.app/
|| Link for External uploads from unauthorized users : https://google-solution-challenge-umber.vercel.app/external-upload
