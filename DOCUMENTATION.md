# 📘 Project Documentation
## DEPI Support AI Assistant + Infographic Generator

> **Digital Egypt Pioneers Initiative (DEPI) — R4 Graduation Project**
> Python 3.12 · Flask · FAISS · Sentence-Transformers · TF-IDF · HTML5 Canvas

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Installation & Setup](#4-installation--setup)
5. [Configuration](#5-configuration)
6. [API Reference](#6-api-reference)
7. [Retrieval Pipeline](#7-retrieval-pipeline)
8. [Placeholder & Response System](#8-placeholder--response-system)
9. [Frontend Pages](#9-frontend-pages)
10. [Infographic Generator](#10-infographic-generator)
11. [Deployment](#11-deployment)
12. [Troubleshooting](#12-troubleshooting)
13. [File Reference](#13-file-reference)

---

## 1. Project Overview

This project is a **production-ready AI-powered customer support chatbot** deployed as a Flask web application. It uses semantic vector search (FAISS + Sentence-Transformers) to match user questions against a large dataset of support intents and returns contextually appropriate responses.

Alongside the chatbot, the project includes a **DEPI Infographic Generator** — a client-side tool that allows R4 graduation project groups to generate premium 16:9 presentation slides from their project documents.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🤖 Semantic Search | Matches questions using dense vector embeddings (BAAI/bge-m3) |
| ⚡ TF-IDF Fallback | Gracefully falls back to keyword-based retrieval if GPU/model fails |
| 📦 FAISS Indexing | Fast approximate nearest-neighbor search over thousands of intents |
| 🔗 Context Awareness | Tracks last matched intent to improve follow-up answer quality |
| 🛡️ Placeholder System | Dynamically replaces template variables in responses |
| 🎨 Infographic Generator | Generates 1920×1080 PNG slides for DEPI graduation projects |
| 🚀 Production Ready | Gunicorn + Procfile for Render / Heroku deployment |

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                              │
│   ┌─────────────────┐      ┌──────────────────────────────┐  │
│   │  Chatbot UI      │      │  Infographic Generator       │  │
│   │  (index.html)    │      │  (infograph.html)            │  │
│   │  style.css       │      │  infograph.css + .js         │  │
│   │  app.js          │      │  HTML5 Canvas (1920×1080)    │  │
│   └────────┬─────────┘      └──────────────────────────────┘  │
└────────────│─────────────────────────────────────────────────-┘
             │ POST /api/chat
             ▼
┌──────────────────────────────────────────────────────────────┐
│                     FLASK APPLICATION (app.py)               │
│                                                              │
│   Routes:                                                    │
│   GET  /           → Chatbot page                           │
│   GET  /track      → Order tracking page                    │
│   GET  /infograph  → Infographic generator                   │
│   POST /api/chat   → RAG inference endpoint                  │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                 ask_rag() function                    │  │
│   │                                                       │  │
│   │  normalize(question)                                  │  │
│   │       ↓                                               │  │
│   │  [Backend: sentence-transformers]  OR  [TF-IDF]      │  │
│   │       ↓                                               │  │
│   │  FAISS index.search() / tfidf_matrix @ query          │  │
│   │       ↓                                               │  │
│   │  threshold check (cosine score ≥ 0.45)               │  │
│   │       ↓                                               │  │
│   │  records.loc[rec_id] → response template              │  │
│   │       ↓                                               │  │
│   │  clean_response() → replace {{placeholders}}          │  │
│   │       ↓                                               │  │
│   │  return { answer, score, matched_intent, backend }    │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                              │
│   records.csv          ← Source of truth (intents + resp.)  │
│   vector_index.faiss   ← Pre-built FAISS index (float32)    │
│   id_map.json          ← Maps FAISS row indices → record IDs│
└──────────────────────────────────────────────────────────────┘
```

### Retrieval Backend Selection

```
App starts
    ↓
Try: load SentenceTransformer("BAAI/bge-m3")
    ↓ success                  ↓ failure (DLL / GPU / memory)
sentence-transformers        TF-IDF fallback
backend                      backend (scikit-learn)
    ↓                              ↓
FAISS IndexFlatIP              TfidfVectorizer
(cosine similarity)            (ngram 1-2, min_df=2)
```

---

## 3. Project Structure

```
d:\DEBI\final_test\
│
├── app.py                      ← Main Flask application
├── requirements.txt            ← Python dependencies
├── Procfile                    ← Gunicorn process definition (deployment)
├── runtime.txt                 ← Python version pin (3.12.4)
├── .gitignore
│
├── records.csv                 ← Training/knowledge dataset (intents + responses)
├── vector_index.faiss          ← Pre-built FAISS vector index (auto-generated)
├── id_map.json                 ← FAISS index → record ID mapping (auto-generated)
├── scratch_placeholders.txt    ← Reference list of all known placeholder keys
│
├── templates/
│   ├── index.html              ← Chatbot UI page
│   ├── track.html              ← Order tracking page
│   └── infograph.html          ← Infographic Generator page (DEPI)
│
├── static/
│   ├── style.css               ← Chatbot & global styles
│   ├── app.js                  ← Chatbot frontend logic
│   ├── infograph.css           ← Infographic Generator styles
│   └── infograph.js            ← Canvas renderer + document parser
│
├── saved_t5_model/             ← (Optional) saved model weights directory
└── .venv/                      ← Python virtual environment
```

---

## 4. Installation & Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.12.4 |
| pip | Latest |
| Git | Any |
| RAM | ≥ 4 GB (8 GB recommended for sentence-transformers) |
| Disk | ≥ 2 GB (FAISS index + model weights) |

### Step-by-Step Local Setup

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd final_test
```

**2. Create and activate a virtual environment**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the application**
```bash
python app.py
```

**5. Open in browser**
```
http://127.0.0.1:5000          ← Chatbot
http://127.0.0.1:5000/infograph ← Infographic Generator
http://127.0.0.1:5000/track    ← Order Tracking
```

> [!NOTE]
> On first startup, if `vector_index.faiss` or `id_map.json` do not exist, they are **automatically generated** from `records.csv`. This may take several minutes depending on hardware and dataset size.

---

## 5. Configuration

All configuration constants are defined at the top of [`app.py`](file:///d:/DEBI/final_test/app.py):

| Constant | Default | Description |
|----------|---------|-------------|
| `TOP_K` | `1` | Number of nearest neighbors retrieved from FAISS |
| `DEFAULT_THRESHOLD` | `0.45` | Minimum cosine similarity score to return a match |
| `RECORDS_PATH` | `records.csv` | Path to the knowledge base CSV file |
| `INDEX_PATH` | `vector_index.faiss` | Path to FAISS index file |
| `ID_MAP_PATH` | `id_map.json` | Path to index-to-ID mapping file |

### `records.csv` Schema

The CSV must contain the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| `id` | Optional* | Unique record identifier (auto-generated if missing) |
| `intent` | ✅ | Short label for the question category |
| `category` | ✅ | High-level group (e.g., "billing", "shipping") |
| `instruction` | ✅ | The canonical question / training phrase |
| `composite_text` | Optional* | Pre-combined search field (auto-built if missing) |
| `response` | ✅ | The answer template (may contain `{{placeholders}}`) |

*\* Auto-generated at runtime if the column is missing.*

### `COMPANY_INFO` Dictionary

Hardcoded placeholder values resolved at runtime in `clean_response()`:

```python
COMPANY_INFO = {
    "Customer Support Hours":       "9 AM to 5 PM EST, Monday through Friday",
    "Customer Support Phone Number": "1-800-123-4567",
    "Website URL":                  "www.example.com",
    "Online Company Portal Info":   "Company Portal",
    "Online Order Interaction":     "My Orders section",
    "Order Tracking":               "<a href='/track'>Track Order</a>",
}
```

> [!TIP]
> Update these values to match your actual company information before going to production.

---

## 6. API Reference

### `GET /`
Returns the main chatbot HTML page.

**Response:** `200 OK` — `text/html`

---

### `GET /track`
Returns the order tracking HTML page.

**Response:** `200 OK` — `text/html`

---

### `GET /infograph`
Returns the DEPI Infographic Generator HTML page.

**Response:** `200 OK` — `text/html`

---

### `POST /api/chat`
Main inference endpoint. Accepts a user question and returns the best matching answer.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message":     "Where is my order?",
  "threshold":   0.45,
  "last_intent": "order_status"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `message` | `string` | ✅ | — | The user's question |
| `threshold` | `float` | ❌ | `0.45` | Minimum confidence score (0.0–1.0) |
| `last_intent` | `string` | ❌ | `null` | Previous matched intent for context |

**Success Response `200 OK`:**
```json
{
  "answer":         "Your order ORD-12345 is being processed...",
  "score":          0.8742,
  "matched_intent": "order_status",
  "backend":        "sentence-transformers"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `answer` | `string` | The resolved response (placeholders replaced) |
| `score` | `float` | Cosine similarity score of the best match |
| `matched_intent` | `string\|null` | The intent label of the matched record |
| `backend` | `string` | `"sentence-transformers"` or `"tfidf"` |

**Below-threshold Response (no match found):**
```json
{
  "answer":         "I don't have enough information to answer that.",
  "score":          0.1234,
  "matched_intent": null,
  "backend":        "sentence-transformers"
}
```

**Error Response `400 Bad Request`:**
```json
{
  "error": "message is required"
}
```

---

## 7. Retrieval Pipeline

### Step-by-step Flow

```
1. User sends question via POST /api/chat
          ↓
2. load_or_build() called (thread-safe, runs once per process)
          ↓
3. normalize(question)
   - Replaces {{placeholder}} patterns with [ENTITY]
   - Collapses multiple [ENTITY] tokens
          ↓
4. Context enrichment (if last_intent provided)
   - search_query = f"{last_intent} {question}"
          ↓
5A. sentence-transformers backend:
    embed_model.encode([query], normalize_embeddings=True)
    → query vector (float32, 1024-dim for bge-m3)
    → faiss.index.search(query, TOP_K=1)
    → cosine similarity score in [-1, 1]

5B. TF-IDF fallback backend:
    tfidf_vectorizer.transform([query])
    → sparse vector
    → tfidf_matrix @ query.T (dot product)
    → score adjusted threshold (min 0.12)
          ↓
6. score < threshold?  → return fallback answer
   score ≥ threshold?  → fetch record from records DataFrame
          ↓
7. clean_response(record["response"], original_question)
   - Replaces {{Placeholder Name}} with real values
   - Extracts order numbers from question via regex
          ↓
8. Return JSON { answer, score, matched_intent, backend }
```

### Index Lifecycle

```
Startup
  ├── vector_index.faiss + id_map.json exist? → load from disk
  └── Missing? → build_faiss_artifacts()
       ├── Read records.csv
       ├── Build composite_text = intent + category + instruction
       ├── Encode all rows with SentenceTransformer (batch_size=64)
       ├── Create IndexFlatIP (Inner Product = cosine on normalized vecs)
       ├── Write vector_index.faiss
       └── Write id_map.json { "0": "rec_00000", "1": "rec_00001", ... }
```

---

## 8. Placeholder & Response System

### How Placeholders Work

Response templates in `records.csv` may contain variables wrapped in double curly braces:

```
"To reset your password, visit {{Password Reset Page URL}} and follow the steps."
```

The `clean_response()` function replaces these at runtime using a two-tier priority system:

**Priority 1 — Dynamic (extracted from the question):**
| Placeholder Key | Source |
|-----------------|--------|
| `Order Number` | Regex: `\b(?:#|[A-Za-z]{2,}-)?\\d{4,}\b` applied to user question |

**Priority 2 — Static (`COMPANY_INFO` dict):**
| Placeholder Key | Resolved Value |
|-----------------|----------------|
| `Customer Support Hours` | 9 AM to 5 PM EST, Mon–Fri |
| `Customer Support Phone Number` | 1-800-123-4567 |
| `Website URL` | www.example.com |
| `Online Company Portal Info` | Company Portal |
| `Online Order Interaction` | My Orders section |
| `Order Tracking` | `<a href='/track'>Track Order</a>` |

**Priority 3 — Heuristic fallbacks (for unknown keys):**

| Key contains | Resolved to |
|--------------|-------------|
| `email` | support@example.com |
| `url`, `link`, `website`, `page` | "our website" |
| `phone`, `number`, `hotline` | 1-800-555-0199 |
| `time`, `days`, `hours`, `period` | "2 to 3 business days" |
| `date` | "the scheduled date" |
| `name` | "John Doe" |
| `city`, `country`, `address`, `location` | "your registered address" |
| `password`, `pin`, `key` | "your secure credentials" |
| `amount` | "$0.00" |
| `account`, `profile` | "your account" |
| *(anything else)* | `"the <key>"` |

> [!NOTE]
> The full list of 392 known placeholder keys is in [`scratch_placeholders.txt`](file:///d:/DEBI/final_test/scratch_placeholders.txt). Any key not in `COMPANY_INFO` falls through to heuristic resolution.

---

## 9. Frontend Pages

### Chatbot Page (`/`)

**File:** [`templates/index.html`](file:///d:/DEBI/final_test/templates/index.html) + [`static/style.css`](file:///d:/DEBI/final_test/static/style.css) + [`static/app.js`](file:///d:/DEBI/final_test/static/app.js)

**Features:**
- Dark glassmorphism design with animated background orbs
- Auto-growing textarea (Enter to send, Shift+Enter for newline)
- **Confidence slider** — adjustable threshold (0.20 → 0.90) shown in real time
- Bot/user message bubbles with intent + score metadata
- Context tracking: `last_intent` sent with every follow-up message
- Navigation link to Infographic Generator

**JavaScript API call (in `app.js`):**
```js
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, threshold, last_intent })
})
```

---

### Order Tracking Page (`/track`)

**File:** [`templates/track.html`](file:///d:/DEBI/final_test/templates/track.html)

Simple standalone page allowing users to enter an order number. Returns a static confirmation message (no backend lookup — intended as a demo placeholder).

---

### Infographic Generator (`/infograph`)

See [Section 10](#10-infographic-generator) for full details.

---

## 10. Infographic Generator

**Files:**
- [`templates/infograph.html`](file:///d:/DEBI/final_test/templates/infograph.html)
- [`static/infograph.css`](file:///d:/DEBI/final_test/static/infograph.css)
- [`static/infograph.js`](file:///d:/DEBI/final_test/static/infograph.js)

### Purpose

Allows DEPI R4 graduation project groups to generate a **premium 16:9 infographic slide** (1920×1080 PNG) from their project document — no external AI API required.

### 4-Step Workflow

```
Step 1 ─ Select DEPI Track
   Click one of 10 track cards (AI & Data Science, DevOps, Full Stack .NET, etc.)
          ↓
Step 2 ─ Upload / Paste Document
   Drag & drop a .txt/.md file   OR   paste text into textarea
   Click "⚡ Auto-Extract Content" → JS parser extracts key fields
          ↓
Step 3 ─ Review & Edit Details
   Auto-filled fields appear:
   Title, Summary, Problem, Solution, Users, Features (5 max),
   Architecture, AI Components, Deliverables, Future, Team, Duration
   + Tech stack chips (50+ technologies, searchable)
   + Phase chips (Planning → Maintenance)
          ↓
Step 4 ─ Generate & Download
   Click "🎨 Generate Infographic"
   → HTML5 Canvas renders 1920×1080 slide
   → Choose color theme (Blue / Teal / Violet / Orange)
   → Click "⬇️ Download PNG"
```

### Canvas Layout (1920 × 1080)

```
┌──────────────────────────────────────────────────────────────────┐
│ █ DEPI wordmark │ Track pill │     Project Title     │ Team info  │ 8%
├──────────┬──────────┬──────────┬───────────────────────────────--─┤
│ PROBLEM  │ SOLUTION │  USERS   │  DEPLOYMENT                      │ 16%
├──────────┴──────────┼──────────────────────┬──────────────────────┤
│ ✦ CORE FEATURES    │ ⚡ ARCHITECTURE       │ ⚙️ TECH STACK        │ 16%
│  • Feature 1       │  [UI]→[API]→[AI]→[DB] │  Python Flask React  │
│  • Feature 2       │  🤖 AI components     │  Docker AWS Redis ... │
│  • Feature 3       │                       │                      │
├────────────────────┴───────────────────────┼──────────────────────┤
│  📅 DEVELOPMENT ROADMAP TIMELINE           │  ✅ DELIVERABLES     │ 14%
│  Planning→Design→Dev→Test→Deploy→Maintain  │  ✔ Working System   │
│                                            │  ✔ Dashboard        │
└────────────────────────────────────────────┴──────────────────────┘
         DEPI • Graduation Project Infographic footer              2%
```

### Document Parser (`parseDocument()`)

The JS parser uses regex pattern matching to extract sections from any free-text project document:

| Field | Patterns Searched |
|-------|------------------|
| Title | `project title`, `project name`, `title`, `# ` heading |
| Summary | `abstract`, `summary`, `overview`, `introduction` |
| Problem | `problem`, `challenge`, `issue`, `pain point` |
| Solution | `solution`, `proposed solution`, `approach`, `methodology` |
| Users | `target user`, `user`, `audience`, `stakeholder` |
| Deployment | `deploy`, `hosting`, `cloud`, `environment` |
| Features | Bullet-list lines following any "feature/function/capability" heading |
| Tech Stack | Auto-detects 50+ technology names from the full document text |
| Phases | Detects Planning/Design/Development/Testing/Deployment/Maintenance |

### Supported DEPI Tracks

| # | Track | Icon |
|---|-------|------|
| 1 | AI & Data Science | 🧠 |
| 2 | Data Engineering | 🗄️ |
| 3 | Full Stack .NET | ⚙️ |
| 4 | Full Stack Python | 🐍 |
| 5 | Front-End Development | 🎨 |
| 6 | DevOps | 🔁 |
| 7 | Cloud Computing | ☁️ |
| 8 | Cybersecurity | 🔐 |
| 9 | Embedded Systems | 🔌 |
| 10 | Mobile Development | 📱 |

---

## 11. Deployment

### Render / Heroku / Railway

The project is pre-configured for WSGI deployment via Gunicorn.

**`Procfile`:**
```
web: gunicorn app:app
```

**`runtime.txt`:**
```
python-3.12.4
```

**Steps:**

1. Push the repository to GitHub
2. Create a new Web Service on Render (or equivalent)
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `gunicorn app:app`
5. Set environment variable `PORT` if required by the platform

> [!WARNING]
> `vector_index.faiss` (≈105 MB) and `records.csv` (≈19 MB) must be committed to the repository or provided via persistent disk storage. Ephemeral file systems (like Heroku free tier) will lose generated indexes on restart.

> [!IMPORTANT]
> The `sentence-transformers` model (`BAAI/bge-m3`) is downloaded from Hugging Face at first startup (~600 MB). Ensure sufficient disk space and memory on your deployment host, or use the TF-IDF fallback by removing `sentence-transformers` and `torch` from `requirements.txt`.

### Environment Variables (Optional)

No environment variables are required in the default configuration. You may optionally set:

| Variable | Purpose |
|----------|---------|
| `PORT` | Override the default port (Flask default: 5000) |
| `FLASK_ENV` | Set to `production` to disable debug mode |

### Running with Gunicorn (Local)

```bash
gunicorn app:app --workers 2 --bind 0.0.0.0:5000
```

> [!TIP]
> Use `--preload` flag with Gunicorn to load the model once before forking workers, which prevents each worker from loading the model independently.

```bash
gunicorn app:app --workers 2 --bind 0.0.0.0:5000 --preload
```

---

## 12. Troubleshooting

### ❌ App starts but answers are always "I don't have enough information"

**Cause:** Similarity scores are all below the threshold.

**Fix:**
- Lower the confidence slider in the UI (try 0.20–0.35)
- Or lower `DEFAULT_THRESHOLD` in `app.py`
- Verify that `records.csv` has the correct columns (`intent`, `instruction`, `response`)

---

### ❌ `faiss` import error on Windows

**Cause:** FAISS requires specific C++ runtime DLLs.

**Fix:**
```bash
pip uninstall faiss-cpu
pip install faiss-cpu --no-cache-dir
```
Or install Microsoft Visual C++ Redistributable.

---

### ❌ `sentence_transformers` fails to load on startup

**Cause:** Insufficient GPU memory, missing PyTorch build, or DLL conflict on Windows.

**Behavior:** The app **automatically falls back to TF-IDF** — this is expected and handled gracefully. The `backend` field in API responses will show `"tfidf"`.

---

### ❌ FAISS index is stale after updating `records.csv`

**Fix:** Delete both cache files and restart:
```bash
del vector_index.faiss
del id_map.json
python app.py
```

---

### ❌ Infographic Generator canvas is blank

**Cause:** The canvas renders on load, but `f-title` is empty.

**Fix:** Enter a project title in Step 3, then click "Generate Infographic".

---

### ❌ PNG download is low quality

**Cause:** The canvas is always 1920×1080 internally. If the preview looks blurry, it's just the browser scaling — the downloaded PNG is always full resolution.

---

## 13. File Reference

| File | Role | Auto-generated |
|------|------|----------------|
| [`app.py`](file:///d:/DEBI/final_test/app.py) | Flask app, routing, RAG pipeline | No |
| [`records.csv`](file:///d:/DEBI/final_test/records.csv) | Knowledge base: intents + responses | No |
| [`vector_index.faiss`](file:///d:/DEBI/final_test/vector_index.faiss) | FAISS dense vector index | **Yes** |
| [`id_map.json`](file:///d:/DEBI/final_test/id_map.json) | Index row → record ID mapping | **Yes** |
| [`requirements.txt`](file:///d:/DEBI/final_test/requirements.txt) | Python package dependencies | No |
| [`Procfile`](file:///d:/DEBI/final_test/Procfile) | Gunicorn deployment command | No |
| [`runtime.txt`](file:///d:/DEBI/final_test/runtime.txt) | Python version for deployment | No |
| [`scratch_placeholders.txt`](file:///d:/DEBI/final_test/scratch_placeholders.txt) | Reference list of 392 placeholder keys | No |
| [`templates/index.html`](file:///d:/DEBI/final_test/templates/index.html) | Chatbot UI | No |
| [`templates/track.html`](file:///d:/DEBI/final_test/templates/track.html) | Order tracking page | No |
| [`templates/infograph.html`](file:///d:/DEBI/final_test/templates/infograph.html) | Infographic Generator UI | No |
| [`static/style.css`](file:///d:/DEBI/final_test/static/style.css) | Chatbot styles | No |
| [`static/app.js`](file:///d:/DEBI/final_test/static/app.js) | Chatbot frontend logic | No |
| [`static/infograph.css`](file:///d:/DEBI/final_test/static/infograph.css) | Infographic Generator styles | No |
| [`static/infograph.js`](file:///d:/DEBI/final_test/static/infograph.js) | Canvas renderer + doc parser | No |

---

*Documentation generated: August 2026 · DEPI R4 Cohort*
