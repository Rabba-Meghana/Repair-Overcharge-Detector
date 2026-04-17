# ROD — Repair Overcharge Detector

Multi-model AI engine for detecting automotive repair invoice fraud. Runs two LLMs in parallel, cross-validates results, and produces a confidence-weighted consensus verdict.

## Architecture

```
frontend (React)  →  FastAPI  →  Consensus Engine
                                 ├── LLaMA-3.3-70B (Groq)
                                 └── Mixtral-8x7B (Groq)
                          ↓
                     SQLite (aiosqlite)
                     In-memory TTL cache
```

## Features

- **Multi-model consensus** — LLaMA-3.3-70B and Mixtral-8x7B run in parallel via `asyncio.gather`. Results are cross-validated; confidence is boosted on agreement, penalized on divergence.
- **29-repair benchmark database** — US national average pricing across 6 categories (Routine Maintenance, Brakes, Electrical, Engine & Drivetrain, Exhaust & Suspension, Filters & Ignition)
- **Vehicle class multipliers** — Standard, Luxury (1.3x), Commercial (1.15x), Fleet (1.1x), Heavy Duty (1.25x), Electric (1.2x)
- **Persistent history** — Every analysis stored in SQLite with full payload. Queryable via REST.
- **TTL caching** — Identical work orders return cached results within 1 hour.
- **JSON export** — Every analysis exportable as a structured report.
- **Docker deploy** — Single `docker-compose up` runs the full stack.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Recharts |
| Backend | FastAPI, Python 3.12 |
| AI | Groq (LLaMA-3.3-70B + Mixtral-8x7B) |
| Database | SQLite via aiosqlite |
| Deployment | Docker + nginx |

## Local Setup

```bash
git clone https://github.com/Rabba-Meghana/Repair-Overcharge-Detector.git
cd Repair-Overcharge-Detector
```

**Backend:**
```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

Get a free Groq API key at https://console.groq.com/keys

## Docker

```bash
cp backend/.env.example backend/.env   # add GROQ_API_KEY
docker-compose up --build
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/analysis/` | Run analysis (pass key in `X-API-Key` header) |
| `GET` | `/api/v1/benchmarks/` | Benchmark rates by category |
| `GET` | `/api/v1/history/` | Analysis history |
| `GET` | `/api/v1/history/stats` | Aggregate statistics |
| `GET` | `/api/v1/reports/{id}/export` | Export analysis as JSON |
| `GET` | `/api/docs` | Interactive API docs (Swagger) |

## Tests

```bash
cd backend
pytest tests/ -v
```
