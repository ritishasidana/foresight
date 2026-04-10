"""
main.py
-------
ForeSight FastAPI application entry point.

Endpoints:
  POST /upload              — Upload a CSV file, get column info back.
  POST /analyse             — Run full analysis: forecast + anomaly +
                              validation + scenarios + AI narration.
  POST /anomaly/{index}/explain — Get Claude explanation for one anomaly.
  POST /scenario/custom     — Run a user-defined growth % scenario.
  POST /ask                 — Answer a plain-English question about the data.
  GET  /health              — Liveness check for deployment monitoring.

Session storage:
  In-memory dict `_session` holds the last uploaded DataFrame and
  analysis results. This is intentional for a hackathon — it keeps
  the stack simple and stateless. A production version would use
  Redis or a proper session store.

CORS:
  Allow all origins during development. In production this should be
  restricted to the deployed frontend domain.
"""

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.data_utils import (
    detect_columns,
    parse_csv,
    prepare_series,
    quality_report,
)
from src.forecast import run_forecast
from src.anomaly import detect_anomalies
from src.validation import run_validation
from src.scenarios import run_scenarios, run_custom_scenario
from src.narrator import (
    answer_question,
    narrate_anomaly,
    narrate_forecast,
    narrate_key_findings,
)

app = FastAPI(
    title="ForeSight API",
    description=(
        "AI-powered predictive forecasting backend. "
        "Provides ETS forecasting, anomaly detection, backtesting, "
        "scenario comparison, and Claude-powered plain-English narration."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── In-memory session store ────────────────────────────────────────────────
# Stores the last uploaded dataset and analysis results for reuse
# across /anomaly/explain, /ask, and /scenario/custom endpoints.
_session: dict = {}


# ── Request / response models ──────────────────────────────────────────────

class AnalyseRequest(BaseModel):
    date_col: str
    value_col: str
    periods: int = 4
    dataset_label: str = "your data"


class QuestionRequest(BaseModel):
    question: str
    dataset_label: str = "your data"


class CustomScenarioRequest(BaseModel):
    growth_pct: float
    periods: int = 4


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.post("/upload", summary="Upload a CSV file")
async def upload(file: UploadFile = File(...)):
    """
    Accept a CSV upload and return detected column information.

    The client uses this to let the user confirm which column is the
    date and which is the value before running the full analysis.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )

    content = await file.read()
    df = parse_csv(content)
    detected = detect_columns(df)

    # Store for subsequent endpoints
    _session["df"] = df
    _session["filename"] = file.filename

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "date_col": detected["date_col"],
        "value_cols": detected["value_cols"],
    }


@app.post("/analyse", summary="Run full forecast analysis")
async def analyse(req: AnalyseRequest):
    """
    Run the complete ForeSight analysis pipeline.

    Steps (in order):
    1. Prepare and validate the time series.
    2. Run the ETS forecast with confidence bands.
    3. Detect historical anomalies.
    4. Backtest the model against baselines.
    5. Generate scenario comparisons.
    6. Ask Claude to narrate results in plain English.
    7. Return everything in a single response for the dashboard.
    """
    if "df" not in _session:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded. Call /upload first."
        )

    df = _session["df"]

    # Validate column names exist
    if req.date_col not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{req.date_col}' not found in uploaded file."
        )
    if req.value_col not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{req.value_col}' not found in uploaded file."
        )

    # Prepare series and run quality check
    raw_series = prepare_series(df, req.date_col, req.value_col)
    quality = quality_report(raw_series)
    series = quality.pop("series_clean")   # clean series extracted here

    # Core analysis
    forecast = run_forecast(series, req.periods)
    anomalies = detect_anomalies(series)
    validation = run_validation(series,holdout=req.periods)
    scenarios = run_scenarios(series, req.periods)

    # AI narration
    narration = narrate_forecast(forecast, validation, req.dataset_label)
    key_findings = narrate_key_findings(forecast, anomalies, validation)

    # Cache for follow-up endpoints
    _session["series"] = series
    _session["forecast"] = forecast
    _session["anomalies"] = anomalies
    _session["validation"] = validation
    _session["date_col"] = req.date_col
    _session["value_col"] = req.value_col
    _session["label"] = req.dataset_label

    return {
        "quality": quality,
        "forecast": forecast,
        "anomalies": anomalies,
        "validation": validation,
        "scenarios": scenarios,
        "narration": narration,
        "key_findings": key_findings,
    }


@app.post(
    "/anomaly/{index}/explain",
    summary="Get plain-English explanation for one anomaly"
)
async def explain_anomaly(index: int):
    """
    Generate a Claude explanation for a specific anomaly by its list index.

    Called when a user clicks an anomaly badge on the dashboard.
    """
    if "anomalies" not in _session:
        raise HTTPException(
            status_code=400,
            detail="No analysis found. Call /analyse first."
        )

    anomalies = _session["anomalies"]

    if index < 0 or index >= len(anomalies):
        raise HTTPException(
            status_code=404,
            detail=f"Anomaly index {index} not found. "
                   f"Available: 0–{len(anomalies) - 1}."
        )

    explanation = narrate_anomaly(
        anomalies[index],
        {
            "dataset": _session.get("label", "data"),
            "total_anomalies": len(anomalies),
        },
    )
    return {"index": index, "explanation": explanation}


@app.post("/scenario/custom", summary="Run a custom growth scenario")
async def custom_scenario(req: CustomScenarioRequest):
    """
    Compute a forecast under a user-specified growth percentage.

    Example: growth_pct=15.0 applies a +15% multiplier to the baseline.
    """
    if "series" not in _session:
        raise HTTPException(
            status_code=400,
            detail="No analysis found. Call /analyse first."
        )

    if not -100 <= req.growth_pct <= 500:
        raise HTTPException(
            status_code=400,
            detail="growth_pct must be between -100 and 500."
        )

    result = run_custom_scenario(
        _session["series"], req.periods, req.growth_pct
    )
    return result


@app.post("/ask", summary="Answer a plain-English question about the data")
async def ask(req: QuestionRequest):
    """
    Accept a natural language question and return a Claude-generated answer
    grounded in the current dataset's forecast and anomaly data.
    """
    if "forecast" not in _session:
        raise HTTPException(
            status_code=400,
            detail="No analysis found. Call /analyse first."
        )

    if not req.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    answer = answer_question(
        req.question,
        _session["forecast"],
        _session["anomalies"],
        _session["validation"],
        req.dataset_label,
    )
    return {"question": req.question, "answer": answer}


@app.get("/health", summary="Liveness check")
def health():
    """Returns 200 OK if the API is running. Used by deployment platforms."""
    return {"status": "ok", "version": "1.0.0"}
