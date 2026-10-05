from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Prediction, Bin
from ..schemas import PredictionOut, GeneratePredictionRequest
from ai_service.forecaster import forecaster_service

router = APIRouter(prefix="/predictions", tags=["AI Fill Predictions"])

@router.get("", response_model=List[PredictionOut])
def get_predictions(
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get latest fill level predictions for smart bins."""
    return db.query(Prediction).order_by(Prediction.generated_at.desc()).limit(limit).all()

@router.get("/bin/{bin_id}")
def get_bin_prediction_details(bin_id: int, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Run dynamic ML forecast
    forecast = forecaster_service.predict_bin(
        bin_id=b.id,
        current_fill_pct=b.current_fill_pct,
        capacity_liters=b.capacity_liters,
        area_type=b.area
    )
    return forecast

@router.post("/generate")
def generate_prediction(payload: GeneratePredictionRequest, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == payload.bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    forecast = forecaster_service.predict_bin(
        bin_id=b.id,
        current_fill_pct=b.current_fill_pct,
        capacity_liters=b.capacity_liters,
        area_type=b.area
    )

    pred = Prediction(
        bin_id=b.id,
        predicted_full_time=forecast["predicted_full_time"],
        hours_until_full=forecast["hours_until_full"],
        expected_fill_pct_24h=forecast["expected_fill_pct_24h"],
        overflow_probability=forecast["overflow_probability"],
        peak_hours=forecast["peak_hours"],
        generated_at=datetime.utcnow()
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return {
        "prediction": pred,
        "forecast_curve": forecast["forecast_curve"],
        "fill_velocity_pct_per_hr": forecast["fill_velocity_pct_per_hr"]
    }
