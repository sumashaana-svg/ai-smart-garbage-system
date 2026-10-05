from datetime import datetime, timedelta
import math
from typing import Dict, Any, List

class AIFillLevelForecaster:
    """
    Predictive analytics engine for Smart Dustbins.
    Calculates fill-rate acceleration, overflow probability,
    and generates time-series projection curves.
    """

    PEAK_HOURS_MAP = {
        "Commercial": "12:30 - 15:30 (Lunch/Retail peak)",
        "IT Park": "09:00 - 11:30 & 16:30 - 19:00",
        "Residential": "07:30 - 10:00 & 19:30 - 22:00",
        "Marketplace": "17:00 - 21:30",
        "Transit Hub": "08:00 - 11:00 & 17:30 - 20:30"
    }

    def predict_bin(
        self,
        bin_id: int,
        current_fill_pct: float,
        capacity_liters: float = 120.0,
        area_type: str = "IT Park"
    ) -> Dict[str, Any]:
        """
        Computes hours until 100% capacity, overflow risk, and 24h projection.
        """
        # Average fill rate (% per hour) based on location type
        base_rate = 4.2 # default ~4.2% per hour
        if "IT" in area_type or "Tech" in area_type:
            base_rate = 5.5
        elif "Market" in area_type or "Central" in area_type:
            base_rate = 6.8
        elif "Residential" in area_type:
            base_rate = 3.4

        # Non-linear acceleration as bin nears capacity (people tend to pile on more)
        acceleration_factor = 1.0 + (current_fill_pct / 100.0) * 0.4
        effective_rate = max(0.5, base_rate * acceleration_factor)

        remaining_pct = max(0.0, 100.0 - current_fill_pct)
        hours_until_full = round(remaining_pct / effective_rate, 1)

        predicted_full_time = datetime.utcnow() + timedelta(hours=hours_until_full)

        # Expected fill in 24 hours
        expected_fill_24h = min(100.0, round(current_fill_pct + (effective_rate * 24.0), 1))

        # Overflow probability calculation (Sigmoid-like curve)
        x = (current_fill_pct - 65.0) / 10.0
        overflow_prob = round(1.0 / (1.0 + math.exp(-x)), 3)
        if current_fill_pct >= 95.0:
            overflow_prob = 0.99

        # Peak hours determination
        peak_text = self.PEAK_HOURS_MAP.get(area_type, "12:00 - 15:00 & 18:00 - 20:00")

        # Projected hourly points for graphs
        curve = []
        now = datetime.utcnow()
        for step_hour in [0, 2, 4, 8, 12, 16, 20, 24]:
            projected = min(100.0, round(current_fill_pct + (effective_rate * step_hour), 1))
            t = (now + timedelta(hours=step_hour)).strftime("%H:%M")
            curve.append({"hour_offset": step_hour, "time_label": t, "fill_pct": projected})

        return {
            "bin_id": bin_id,
            "predicted_full_time": predicted_full_time,
            "hours_until_full": hours_until_full,
            "expected_fill_pct_24h": expected_fill_24h,
            "overflow_probability": overflow_prob,
            "peak_hours": peak_text,
            "fill_velocity_pct_per_hr": round(effective_rate, 2),
            "forecast_curve": curve,
            "generated_at": datetime.utcnow()
        }

forecaster_service = AIFillLevelForecaster()
