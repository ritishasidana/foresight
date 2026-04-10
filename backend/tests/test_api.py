"""
tests/test_api.py
-----------------
Integration tests for the FastAPI endpoints.

Uses httpx.AsyncClient with the app's ASGI interface — no real
HTTP server needed. Claude API calls are mocked to avoid API key
requirements during CI testing.
"""

import io
import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def make_csv_bytes(n: int = 52) -> bytes:
    """Generate a minimal valid CSV as bytes for upload tests."""
    np.random.seed(1)
    dates = pd.date_range("2022-01-03", periods=n, freq="W")
    values = 1000 + np.arange(n) * 10 + np.random.normal(0, 30, n)
    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"),
                       "sales": values.round(2)})
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    return buf.getvalue().encode()


# ── /health ────────────────────────────────────────────────────────────────

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ── /upload ────────────────────────────────────────────────────────────────

def test_upload_valid_csv():
    csv_bytes = make_csv_bytes()
    response = client.post(
        "/upload",
        files={"file": ("test.csv", csv_bytes, "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "date_col" in data
    assert "value_cols" in data
    assert data["rows"] == 52


def test_upload_rejects_non_csv():
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"not a csv", "text/plain")},
    )
    assert response.status_code == 400


# ── /analyse ──────────────────────────────────────────────────────────────

def test_analyse_without_upload_fails():
    """Analyse without prior upload must return 400."""
    from main import _session
    _session.clear()
    response = client.post("/analyse", json={
        "date_col": "date",
        "value_col": "sales",
        "periods": 4,
        "dataset_label": "test",
    })
    assert response.status_code == 400


@patch("src.narrator._client")
def test_analyse_full_pipeline(mock_claude):
    """Full pipeline test with mocked Claude to avoid API key requirement."""
    # Mock Claude responses
    mock_msg = MagicMock()
    mock_msg.content = [MagicMock(text="Mocked summary sentence one. "
                                       "Sentence two. Sentence three.")]
    mock_claude.messages.create.return_value = mock_msg

    # Upload first
    csv_bytes = make_csv_bytes()
    client.post(
        "/upload",
        files={"file": ("test.csv", csv_bytes, "text/csv")},
    )

    # Then analyse
    response = client.post("/analyse", json={
        "date_col": "date",
        "value_col": "sales",
        "periods": 4,
        "dataset_label": "test data",
    })
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert "anomalies" in data
    assert "validation" in data
    assert "scenarios" in data
    assert "narration" in data
    assert "key_findings" in data
    assert "quality" in data


# ── /ask ──────────────────────────────────────────────────────────────────

def test_ask_empty_question_fails():
    response = client.post("/ask", json={
        "question": "",
        "dataset_label": "test",
    })
    assert response.status_code == 400
