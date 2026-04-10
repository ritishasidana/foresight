"""
scripts/generate_demo_data.py
------------------------------
Generates the three synthetic NatWest-context demo datasets shipped
with ForeSight. Run this script to regenerate the data/ folder contents.

Usage:
    python scripts/generate_demo_data.py

Each dataset contains 78 weeks (18 months) of realistic data with:
  - A clear trend (upward or downward)
  - Seasonal variation
  - Gaussian noise
  - One planted anomaly for demo purposes
"""

import os
import pandas as pd
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

np.random.seed(42)
N = 78
DATES = pd.date_range("2022-07-04", periods=N, freq="W")
DATE_STRS = DATES.strftime("%Y-%m-%d")


def save(df: pd.DataFrame, filename: str) -> None:
    path = os.path.join(OUTPUT_DIR, filename)
    df.to_csv(path, index=False)
    print(f"  Saved {filename} ({len(df)} rows)")


# ── Dataset 1: Weekly customer churn rate (%) ──────────────────────────────
trend = np.linspace(0.8, 1.1, N)
seasonal = 0.1 * np.sin(2 * np.pi * np.arange(N) / 52)
noise = np.random.normal(0, 0.05, N)
churn = np.clip(trend + seasonal + noise, 0.3, 2.5)
churn[45] = 1.95   # Planted anomaly — unusual churn spike in month 11
save(
    pd.DataFrame({
        "week": DATE_STRS,
        "churn_rate_pct": churn.round(3),
    }),
    "churn_weekly.csv",
)

# ── Dataset 2: Branch transaction volumes ──────────────────────────────────
trend2 = np.linspace(14_000, 17_500, N)
seasonal2 = 800 * np.sin(2 * np.pi * np.arange(N) / 52)
monthly_bump = 300 * np.sin(2 * np.pi * np.arange(N) / 4)
noise2 = np.random.normal(0, 200, N)
txn = trend2 + seasonal2 + monthly_bump + noise2
txn[30] = txn[30] * 0.55  # Planted anomaly — unusual volume dip
save(
    pd.DataFrame({
        "week": DATE_STRS,
        "transaction_volume": txn.round(0).astype(int),
    }),
    "transactions_weekly.csv",
)

# ── Dataset 3: Digital login success rate (%) ──────────────────────────────
trend3 = np.linspace(97.5, 94.2, N)
noise3 = np.random.normal(0, 0.3, N)
logins = np.clip(trend3 + noise3, 80.0, 100.0)
logins[55] = 88.1  # Planted anomaly — critical login failure week
save(
    pd.DataFrame({
        "week": DATE_STRS,
        "login_success_rate_pct": logins.round(2),
    }),
    "logins_weekly.csv",
)

print("All demo datasets generated successfully.")
