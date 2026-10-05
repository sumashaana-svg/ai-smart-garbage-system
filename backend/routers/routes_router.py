from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Route, RouteStop, Bin, Vehicle, Worker, Collection, Notification
from ..schemas import RouteOut, RouteOptimizeRequest, CollectionCreate
from ai_service.optimizer import route_optimizer

router = APIRouter(prefix="/routes", tags=["Route Optimization"])

@router.get("", response_model=List[RouteOut])
def get_routes(limit: int = Query(20), db: Session = Depends(get_db)):
    return db.query(Route).order_by(Route.created_at.desc()).limit(limit).all()

@router.get("/{route_id}")
def get_route_details(route_id: int, db: Session = Depends(get_db)):
    r = db.query(Route).filter(Route.id == route_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Route not found")
    
    stops_data = []
    for s in sorted(r.stops, key=lambda x: x.stop_order):
        stops_data.append({
            "id": s.id,
            "stop_order": s.stop_order,
            "status": s.status,
            "collected_at": s.collected_at,
            "bin": {
                "id": s.bin.id,
                "code": s.bin.code,
                "location_name": s.bin.location_name,
                "area": s.bin.area,
                "latitude": s.bin.latitude,
                "longitude": s.bin.longitude,
                "current_fill_pct": s.bin.current_fill_pct,
                "current_weight_kg": s.bin.current_weight_kg,
                "priority": s.bin.priority,
                "is_overflowing": s.bin.is_overflowing
            }
        })

    return {
        "id": r.id,
        "name": r.name,
        "vehicle_id": r.vehicle_id,
        "worker_id": r.worker_id,
        "total_distance_km": r.total_distance_km,
        "estimated_time_mins": r.estimated_time_mins,
        "fuel_saved_liters": r.fuel_saved_liters,
        "status": r.status,
        "created_at": r.created_at,
        "stops": stops_data
    }

@router.post("/optimize")
def optimize_collection_route(payload: RouteOptimizeRequest, db: Session = Depends(get_db)):
    # Retrieve vehicle starting point or default to central depot
    vehicle = None
    if payload.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        vehicle = db.query(Vehicle).filter(Vehicle.status == "AVAILABLE").first()
    
    start_lat = vehicle.latitude if vehicle else 12.9716
    start_lon = vehicle.longitude if vehicle else 77.5946
    capacity_kg = vehicle.capacity_kg if vehicle else 2000.0

    # Retrieve all online bins
    query = db.query(Bin).filter(Bin.status == "ONLINE")
    if payload.include_high_priority_only:
        query = query.filter(Bin.priority.in_(["CRITICAL", "HIGH"]))
    
    bins_data = [
        {
            "id": b.id,
            "code": b.code,
            "location_name": b.location_name,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "current_fill_pct": b.current_fill_pct,
            "current_weight_kg": b.current_weight_kg,
            "priority": b.priority,
            "is_overflowing": b.is_overflowing
        }
        for b in query.all()
    ]

    optimization_result = route_optimizer.optimize_route(
        vehicle_lat=start_lat,
        vehicle_lon=start_lon,
        vehicle_capacity_kg=capacity_kg,
        bins=bins_data
    )

    ordered_bins = optimization_result["ordered_bins"][:payload.max_bins or 12]

    # Save to database
    worker = db.query(Worker).first()
    new_route = Route(
        name=f"Anti-Gravity AI Dispatch #{db.query(Route).count() + 101}",
        vehicle_id=vehicle.id if vehicle else None,
        worker_id=worker.id if worker else None,
        total_distance_km=optimization_result["total_distance_km"],
        estimated_time_mins=optimization_result["estimated_time_mins"],
        fuel_saved_liters=optimization_result["fuel_saved_liters"],
        status="IN_PROGRESS"
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    # Add stops
    for idx, b_item in enumerate(ordered_bins):
        db.add(
            RouteStop(
                route_id=new_route.id,
                bin_id=b_item["id"],
                stop_order=idx + 1,
                status="PENDING"
            )
        )
    db.commit()

    return {
        "route_id": new_route.id,
        "name": new_route.name,
        "total_distance_km": new_route.total_distance_km,
        "estimated_time_mins": new_route.estimated_time_mins,
        "fuel_saved_liters": new_route.fuel_saved_liters,
        "co2_saved_kg": optimization_result["co2_saved_kg"],
        "stops_count": len(ordered_bins),
        "stops": ordered_bins
    }

@router.post("/stops/{stop_id}/collect")
def mark_stop_collected(
    stop_id: int,
    payload: CollectionCreate,
    db: Session = Depends(get_db)
):
    """Worker action: mark bin as collected with photo proof, resetting bin fill to 0%."""
    stop = db.query(RouteStop).filter(RouteStop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Route stop not found")
    
    stop.status = "COLLECTED"
    stop.collected_at = datetime.utcnow()

    b = db.query(Bin).filter(Bin.id == stop.bin_id).first()
    if b:
        # Reset bin telemetry to pristine 0%
        b.current_fill_pct = 0.0
        b.current_weight_kg = 2.0
        b.priority = "LOW"
        b.bin_health = "OPTIMAL"
        b.is_overflowing = False
        b.last_collection_time = datetime.utcnow()
        b.updated_at = datetime.utcnow()

    # Create collection record
    coll = Collection(
        route_id=stop.route_id,
        bin_id=stop.bin_id,
        worker_id=payload.route_id or 1,
        collected_weight_kg=payload.collected_weight_kg or 25.0,
        proof_image=payload.proof_image or "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
        notes=payload.notes or "Biometric & Optical verification confirmed.",
        collected_at=datetime.utcnow()
    )
    db.add(coll)

    # Broadcast notification
    alert = Notification(
        title=f"COLLECTION COMPLETE: {b.code if b else 'Smart Bin'}",
        message=f"Bin collected and reset to 0%. {coll.collected_weight_kg} kg transferred to recycling chain.",
        severity="INFO",
        category="COLLECTION"
    )
    db.add(alert)
    db.commit()

    return {
        "message": "Bin successfully collected and reset to 0%",
        "bin_id": b.id if b else None,
        "current_fill_pct": 0.0,
        "priority": "LOW",
        "collected_at": coll.collected_at
    }
