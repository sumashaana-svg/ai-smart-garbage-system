import math
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Bin, Sensor
from ..schemas import BinOut, BinCreate, BinUpdate, BinTelemetryUpdate

router = APIRouter(prefix="/bins", tags=["Smart Dustbins"])

@router.get("", response_model=List[BinOut])
def get_all_bins(
    priority: Optional[str] = Query(None, description="Filter by priority: CRITICAL, HIGH, MEDIUM, LOW"),
    area: Optional[str] = Query(None, description="Filter by area name"),
    status: Optional[str] = Query(None, description="Filter by status: ONLINE, OFFLINE, MAINTENANCE"),
    min_fill: Optional[float] = Query(None, description="Filter by minimum fill percentage"),
    db: Session = Depends(get_db)
):
    query = db.query(Bin)
    if priority:
        query = query.filter(Bin.priority == priority.upper())
    if area:
        query = query.filter(Bin.area.ilike(f"%{area}%"))
    if status:
        query = query.filter(Bin.status == status.upper())
    if min_fill is not None:
        query = query.filter(Bin.current_fill_pct >= min_fill)
    
    # Order critical first, then by fill % descending
    bins = query.order_by(
        (Bin.priority == "CRITICAL").desc(),
        (Bin.priority == "HIGH").desc(),
        Bin.current_fill_pct.desc()
    ).all()
    return bins

@router.get("/critical", response_model=List[BinOut])
def get_critical_bins(db: Session = Depends(get_db)):
    """Retrieve all bins flagged as CRITICAL or overflowing."""
    return db.query(Bin).filter(
        (Bin.priority == "CRITICAL") | (Bin.is_overflowing == True) | (Bin.current_fill_pct >= 90.0)
    ).order_by(Bin.current_fill_pct.desc()).all()

@router.get("/nearby", response_model=List[BinOut])
def get_nearby_bins(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """Find smart dustbins within specified radius using Haversine calculation."""
    all_bins = db.query(Bin).all()
    results = []
    
    for b in all_bins:
        # Haversine distance
        d_lat = math.radians(b.latitude - lat)
        d_lon = math.radians(b.longitude - lng)
        a = (
            math.sin(d_lat / 2.0) ** 2
            + math.cos(math.radians(lat))
            * math.cos(math.radians(b.latitude))
            * math.sin(d_lon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance = 6371.0 * c
        if distance <= radius_km:
            results.append((distance, b))
    
    # Sort by closest distance
    results.sort(key=lambda x: x[0])
    return [b for _, b in results]

@router.get("/{bin_id}", response_model=BinOut)
def get_bin(bin_id: int, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")
    return b

@router.post("", response_model=BinOut, status_code=status.HTTP_201_CREATED)
def create_bin(payload: BinCreate, db: Session = Depends(get_db)):
    existing = db.query(Bin).filter(Bin.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bin with this code already exists")
    
    new_bin = Bin(
        code=payload.code,
        location_name=payload.location_name,
        area=payload.area,
        latitude=payload.latitude,
        longitude=payload.longitude,
        capacity_liters=payload.capacity_liters or 120.0,
        current_fill_pct=0.0,
        current_weight_kg=0.0,
        priority=payload.priority or "LOW",
        status="ONLINE",
        bin_health="OPTIMAL"
    )
    db.add(new_bin)
    db.commit()
    db.refresh(new_bin)
    return new_bin

@router.put("/{bin_id}", response_model=BinOut)
def update_bin(bin_id: int, payload: BinUpdate, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    if payload.location_name is not None:
        b.location_name = payload.location_name
    if payload.area is not None:
        b.area = payload.area
    if payload.capacity_liters is not None:
        b.capacity_liters = payload.capacity_liters
    if payload.priority is not None:
        b.priority = payload.priority.upper()
    if payload.status is not None:
        b.status = payload.status.upper()
    
    b.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(b)
    return b

@router.put("/{bin_id}/telemetry", response_model=BinOut)
def update_bin_telemetry(bin_id: int, payload: BinTelemetryUpdate, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")

    if payload.current_fill_pct is not None:
        b.current_fill_pct = payload.current_fill_pct
        if b.current_fill_pct >= 90.0:
            b.priority = "CRITICAL"
            b.is_overflowing = True
            b.bin_health = "CRITICAL"
        elif b.current_fill_pct >= 80.0:
            b.priority = "HIGH"
            b.is_overflowing = False
            b.bin_health = "WARNING"
        elif b.current_fill_pct >= 50.0:
            b.priority = "MEDIUM"
            b.is_overflowing = False
            b.bin_health = "OPTIMAL"
        else:
            b.priority = "LOW"
            b.is_overflowing = False
            b.bin_health = "OPTIMAL"

    if payload.current_weight_kg is not None:
        b.current_weight_kg = payload.current_weight_kg
    if payload.temperature_c is not None:
        b.temperature_c = payload.temperature_c
    if payload.gas_ppm is not None:
        b.gas_ppm = payload.gas_ppm
    if payload.battery_pct is not None:
        b.battery_pct = payload.battery_pct
    if payload.is_fire_hazard is not None:
        b.is_fire_hazard = payload.is_fire_hazard
        if payload.is_fire_hazard:
            b.priority = "CRITICAL"
            b.bin_health = "CRITICAL"
    if payload.is_overflowing is not None:
        b.is_overflowing = payload.is_overflowing
    if payload.is_gas_leak is not None:
        b.is_gas_leak = payload.is_gas_leak

    b.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(b)
    return b

@router.delete("/{bin_id}")
def delete_bin(bin_id: int, db: Session = Depends(get_db)):
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bin not found")
    db.delete(b)
    db.commit()
    return {"message": f"Bin {bin_id} deleted successfully"}
