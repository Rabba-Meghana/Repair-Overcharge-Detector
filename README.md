# 🔍 Repair Overcharge Detector

An AI-powered web app that analyzes auto repair invoices and detects overcharging using **LLaMA 3.3 70B** via Groq.

![Verdict: Severely Overcharged](https://img.shields.io/badge/AI-LLaMA%203.3%2070B-blue) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green) ![React](https://img.shields.io/badge/Frontend-React-61dafb)

## Features

- 🧠 **AI Analysis** — LLaMA 3.3 70B reads work orders like a mechanic expert
- 📊 **29-Repair Benchmark DB** — National average pricing for common services
- 🚗 **Fleet Vehicle Support** — Multipliers for luxury, commercial, EV, and more
- 📈 **Visual Bar Chart** — Charged vs fair market rate per line item
- 🌙 **Dark/Light Mode** — Full theme toggle
- 📋 **Sample Work Orders** — 3 preloaded examples (fair, inflated, severe)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Recharts |
| Backend | FastAPI + Groq SDK |
| AI Model | LLaMA 3.3 70B Versatile |
| Styling | CSS Variables (dark/light) |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

## Usage

1. Get a free Groq API key at https://console.groq.com/keys
2. Paste your repair invoice into the text area
3. Select vehicle type (standard, luxury, fleet, etc.)
4. Click **Detect Overcharges**
5. Review verdict, bar chart, and line-by-line breakdown

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze a work order |
| GET | `/benchmarks` | Get all benchmark rates |
| GET | `/health` | Health check |

## License

MIT
