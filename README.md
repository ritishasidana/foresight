# ForeSight

AI-powered predictive forecasting for financial time-series data. Upload any CSV, get a statistically rigorous forecast, anomaly detection, trend decomposition, backtested accuracy scores, and plain-English AI commentary — in 5–15 seconds.

Live demo: https://foresight-mspf.onrender.com
## Overview

ForeSight is a self-service AI forecasting tool that transforms any
time-series CSV into actionable predictions within 30 seconds.
It addresses the gap faced by NatWest business analysts who currently
rely on manual Excel workflows to understand what their data might do
next — a process that takes hours and produces results too late to act on.
ForeSight gives any non-technical business user honest, transparent
forecasts with confidence bands, anomaly alerts, and plain-English
explanations — no data science background required.

**Target users:** Business analysts, branch managers, and operations
teams at NatWest who need reliable forward-looking insight without
waiting for a data team.

---

## Features

The following features are implemented and working:

- **CSV upload with auto-detection** — drag-and-drop any time-series
  CSV; date and value columns are detected automatically.
- **Data quality report** — checks for missing values, duplicate dates,
  and outliers before forecasting; applies linear interpolation for gaps.
- **ETS forecast with confidence bands** — Exponential Triple Smoothing
  generates a central forecast plus a bootstrapped 80% confidence band
  (low/likely/high) for 1–8 periods ahead.
- **Naive and moving-average baseline comparison** — the model is tested
  against two simple baselines; if a baseline wins, the user is told.
- **Backtesting accuracy panel** — the last 4 periods are held out and
  the model is scored on MAPE, MAE, and confidence band coverage rate.
- **Forecast Health Score (0–100)** — a single dial combining model
  accuracy, band calibration, and data quality into one trust indicator.
- **Anomaly detection** — rolling z-score flags historical spikes and
  dips by severity (mild / warning / critical).
- **Anomaly explanation** — clicking any anomaly badge generates a
  Claude-powered plain-English explanation with a recommended next step.
- **Proactive key findings** — three bullet insights generated
  automatically the moment analysis completes (no user prompt needed).
- **Scenario comparison** — baseline, optimistic (+10%), and pessimistic
  (−10%) forecasts shown side by side; custom percentage also supported.
- **Trend decomposition view** — splits the series into trend, seasonal,
  and residual components with plain-English labels.
- **Plain-English AI summary** — Claude narrates every forecast in three
  sentences using language calibrated to the statistical uncertainty level.
- **Ask a question** — free-text input lets users query the data in
  natural language; answers are grounded in computed forecast context.
- **Three pre-loaded demo datasets** — NatWest-context synthetic data
  (customer churn, branch transactions, login success rate) for
  immediate demonstration without uploading a file.
- **Regulation-aware disclaimer** — every AI output includes a
  decision-support disclaimer appropriate for a regulated environment.

---

## Install and run instructions

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher and npm
- An [Anthropic API key](https://console.anthropic.com/) (free tier)

### 1 — Clone the repository

```bash
git clone <your-repo-url>
cd foresight
```

### 2 — Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
# Open .env and paste your Anthropic API key
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### 3 — Frontend setup

```bash
cd ../frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4 — Run tests

```bash
cd backend
pytest tests/ -v
```

### 5 — Regenerate demo datasets (optional)

```bash
python scripts/generate_demo_data.py
```

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | Python 3.11 | Backend logic and data processing |
| API framework | FastAPI 0.111 | REST API with automatic OpenAPI docs |
| Forecasting | statsmodels 0.14 (ETS) | Exponential Triple Smoothing model |
| Statistics | numpy 1.26, scipy 1.13 | Bootstrap simulation, z-score detection |
| Data | pandas 2.2 | Time-series parsing, cleaning, resampling |
| AI narration | Anthropic Claude API (claude-haiku-4-5) | Plain-English summaries and explanations |
| Frontend | React 18 + Vite | Single-page application |
| Charts | Recharts | Interactive forecast and decomposition charts |
| Styling | Tailwind CSS | Utility-first styling, NatWest brand colours |
| Deploy (backend) | Render (free tier) | Python ASGI hosting |
| Deploy (frontend) | Vercel (free tier) | Static site + CDN |

---

## Usage examples

### Upload a CSV and run analysis

```bash
# 1. Upload your file
curl -X POST http://localhost:8000/upload \
  -F "file=@data/churn_weekly.csv"

# Response: {"filename":"churn_weekly.csv","rows":78,
#            "date_col":"week","value_cols":["churn_rate_pct"]}

# 2. Run full analysis
curl -X POST http://localhost:8000/analyse \
  -H "Content-Type: application/json" \
  -d '{"date_col":"week","value_col":"churn_rate_pct",
       "periods":4,"dataset_label":"Customer Churn Rate"}'
```

### Get an anomaly explanation

```bash
curl -X POST http://localhost:8000/anomaly/0/explain
```

### Ask a question about your data

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Why was week 45 so high?",
       "dataset_label":"Customer Churn Rate"}'
```

### Run a custom growth scenario

```bash
curl -X POST http://localhost:8000/scenario/custom \
  -H "Content-Type: application/json" \
  -d '{"growth_pct": 15.0, "periods": 4}'
```

### Sample forecast output (excerpt)

```json
{
  "forecast": {
    "dates": ["2024-01-08","2024-01-15","2024-01-22","2024-01-29"],
    "forecast": [1.08, 1.11, 1.09, 1.13],
    "band_low":  [0.94, 0.97, 0.95, 0.99],
    "band_high": [1.22, 1.25, 1.23, 1.27]
  },
  "validation": {
    "ets_mape": 6.8,
    "naive_mape": 11.2,
    "health_score": 74,
    "health_label": "green",
    "winner": "ets"
  }
}
```

---

## Architecture notes

```
User browser (React + Recharts)
        |
        | HTTP (JSON)
        v
FastAPI backend (Python)
  ├── data_utils.py   — CSV parsing, quality checks, interpolation
  ├── forecast.py     — ETS model, bootstrap bands, decomposition
  ├── anomaly.py      — Rolling z-score anomaly detection
  ├── validation.py   — Backtesting, MAPE/MAE, health score
  ├── scenarios.py    — Baseline / optimistic / pessimistic scenarios
  └── narrator.py     — Claude API (narration only — no raw data sent)
        |
        | Structured JSON (numbers only — no raw user data)
        v
Anthropic Claude API (claude-haiku-4-5)
```

**Key design decision — Claude does narration only:**
The statistical engine computes all numbers. Claude receives a small
JSON bundle of those results and converts them to plain English. This
means Claude cannot hallucinate a wrong forecast value, API prompts are
tiny (fast and cheap), and no customer data is sent to a third party.

**Why ETS over neural networks:**
ETS (Exponential Triple Smoothing) handles trend and seasonality with
full interpretability — every parameter (alpha, beta, gamma) has a clear
business meaning. Neural networks require far more data and produce
results that are harder to defend to a banking audience.

**Why bootstrap confidence bands:**
Parametric intervals assume normally distributed errors. Bootstrap
resampling makes no such assumption — it builds the band from the
model's actual residuals, giving honest uncertainty estimates that
reflect real model behaviour.

---

## Limitations

- Session storage is in-memory: uploading a new file overwrites the
  previous session. A production deployment would use Redis.
- The seasonal period is inferred by series length, not by statistical
  test. For unusual data frequencies this may be suboptimal.
- The `/ask` endpoint answers from forecast context only; it cannot
  query the raw uploaded CSV directly.
- Scenario bands are computed by proportional scaling, not by
  re-fitting the model under different assumptions.

---

## Future improvements

With more time, the following would be added:

- Multi-user sessions with proper authentication.
- Automatic frequency detection (daily, weekly, monthly) from the date
  column rather than inferring from series length alone.
- Export forecast results as a one-page PDF briefing.
- Support for Excel (.xlsx) uploads in addition to CSV.
- Automated model selection (ETS vs ARIMA vs seasonal decomposition)
  based on data characteristics.

---

## Open-source compliance

All commits are signed off in accordance with the Developer Certificate
of Origin (DCO) using `git commit -s`.

This project is submitted under the Apache License 2.0.

Third-party libraries used are listed in `backend/requirements.txt` and
`frontend/package.json`. All licences have been reviewed and are
compatible with Apache 2.0.

No confidential, proprietary, or personally identifiable data is used
anywhere in this project. The demo datasets in `data/` are fully
synthetic.

---

## Team

Submitted for NatWest Code for Purpose — India Hackathon.
