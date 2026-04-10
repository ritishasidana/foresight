"""
scenarios.py
------------
Generates scenario-based forecasts for side-by-side comparison.

Three pre-set scenarios are always computed:
  - Baseline:    The unmodified ETS central forecast.
  - Optimistic:  Central forecast scaled up by 10%.
  - Pessimistic: Central forecast scaled down by 10%.

Users may also request a custom growth percentage via /scenario/custom.

Why multiply the central forecast rather than re-fitting the model:
- Re-fitting is slow and produces near-identical results for ±10% shifts.
- Multiplying is fast, transparent, and easy to explain to business users.
- The bands are adjusted proportionally to maintain relative uncertainty.
"""

import numpy as np
import pandas as pd
from .forecast import run_forecast


def _apply_multiplier(forecast_values: list,
                      band_low: list,
                      band_high: list,
                      multiplier: float) -> dict:
    """
    Scale a forecast and its confidence band by a growth multiplier.

    Args:
        forecast_values: Central forecast list.
        band_low:        Lower confidence band list.
        band_high:       Upper confidence band list.
        multiplier:      Growth factor (e.g. 1.10 for +10%).

    Returns:
        dict with keys: forecast, low, high — all rounded.
    """
    return {
        "forecast": [round(v * multiplier, 2) for v in forecast_values],
        "low": [round(v * multiplier, 2) for v in band_low],
        "high": [round(v * multiplier, 2) for v in band_high],
    }


def run_scenarios(series: pd.Series, periods: int = 4) -> dict:
    """
    Compute baseline, optimistic (+10%), and pessimistic (-10%) scenarios.

    Args:
        series:  Clean, time-indexed pd.Series.
        periods: Number of future periods to forecast per scenario.

    Returns:
        dict with keys: dates, baseline, optimistic, pessimistic.
        Each scenario value is a dict with forecast, low, high lists.
    """
    base = run_forecast(series, periods)
    fv = base["forecast"]
    bl = base["band_low"]
    bh = base["band_high"]

    return {
        "dates": base["dates"],
        "baseline": _apply_multiplier(fv, bl, bh, 1.00),
        "optimistic": _apply_multiplier(fv, bl, bh, 1.10),
        "pessimistic": _apply_multiplier(fv, bl, bh, 0.90),
    }


def run_custom_scenario(series: pd.Series,
                        periods: int,
                        growth_pct: float) -> dict:
    """
    Compute a scenario for a user-specified growth percentage.

    Args:
        series:     Clean, time-indexed pd.Series.
        periods:    Number of future periods.
        growth_pct: Growth percentage, e.g. 15.0 means +15%.

    Returns:
        dict with keys: dates, forecast, low, high.
    """
    base = run_forecast(series, periods)
    multiplier = 1.0 + (growth_pct / 100.0)
    result = _apply_multiplier(
        base["forecast"], base["band_low"], base["band_high"], multiplier
    )
    result["dates"] = base["dates"]
    result["growth_pct"] = growth_pct
    return result
