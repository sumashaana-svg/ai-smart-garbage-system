from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models import (
    Bin, Complaint, Notification, Prediction, Route, RouteStop,
    Collection, User, Worker, Vehicle
)
from ai_service.classifier import classifier_service
from ai_service.forecaster import forecaster_service
from ai_service.optimizer import route_optimizer

router = APIRouter(prefix="/demo", tags=["End-to-End Demo Flow Automation"])

@router.post("/trigger-flow")
def run_end_to_end_flow(db: Session = Depends(get_db)):
    """
    Executes the complete end-to-end lifecycle flow from Requirement #23:
    1. Citizen reports overflowing bin
    2. AI analyzes report & image
    3. Bin priority becomes CRITICAL
    4. Admin receives real-time notification
    5. AI predicts overflow
    6. Route optimization engine recalculates route
    7. Worker receives optimized route
    8. Worker collects garbage (bin fill -> 0%)
    9. Collection is recorded
    10. Analytics update automatically
    """
    # Step 1: Pick a representative bin (e.g. Indiranagar or Koramangala)
    target_bin = db.query(Bin).filter(Bin.code == "AG-BIN-104").first()
    if not target_bin:
        target_bin = db.query(Bin).first()
    
    # Step 1 & 2: Citizen Report & AI Analysis
    citizen = db.query(User).filter(User.role == "citizen").first()
    ai_classification = classifier_service.classify_image(
        filename="overflowing_plastic_bottles_and_cartons.jpg"
    )

    complaint = Complaint(
        citizen_id=citizen.id if citizen else 1,
        bin_id=target_bin.id,
        title=f"CRITICAL OVERFLOW ALERT @ {target_bin.location_name}",
        description="Public walkway blocked by cascading plastic and recyclable packaging. Immediate dispatch needed.",
        image_url="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
        ai_category=ai_classification["detected_category"],
        priority="CRITICAL",
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(complaint)

    # Step 3: Bin priority escalated to CRITICAL & 98% full
    target_bin.current_fill_pct = 98.4
    target_bin.current_weight_kg = 46.5
    target_bin.priority = "CRITICAL"
    target_bin.bin_health = "CRITICAL"
    target_bin.is_overflowing = True
    target_bin.updated_at = datetime.utcnow()

    # Step 4: Admin receives real-time alert notification
    admin_alert = Notification(
        title=f"CRITICAL OVERFLOW: {target_bin.code}",
        message=f"{target_bin.location_name} reached 98.4% capacity. AI identified {ai_classification['detected_category']} surge. Automated dispatch rerouting initiated.",
        severity="CRITICAL",
        category="OVERFLOW",
        timestamp=datetime.utcnow()
    )
    db.add(admin_alert)

    # Step 5: AI Predicts Overflow Time
    forecast = forecaster_service.predict_bin(
        bin_id=target_bin.id,
        current_fill_pct=target_bin.current_fill_pct,
        capacity_liters=target_bin.capacity_liters,
        area_type=target_bin.area
    )
    pred = Prediction(
        bin_id=target_bin.id,
        predicted_full_time=forecast["predicted_full_time"],
        hours_until_full=0.2, # 12 minutes
        expected_fill_pct_24h=100.0,
        overflow_probability=0.99,
        peak_hours=forecast["peak_hours"],
        generated_at=datetime.utcnow()
    )
    db.add(pred)

    # Step 6 & 7: Route Optimization recalculates route with target bin first
    vehicle = db.query(Vehicle).first()
    worker = db.query(Worker).first()
    
    all_bins_data = [
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
        for b in db.query(Bin).all()
    ]

    opt = route_optimizer.optimize_route(
        vehicle_lat=vehicle.latitude if vehicle else 12.9716,
        vehicle_lon=vehicle.longitude if vehicle else 77.5946,
        vehicle_capacity_kg=vehicle.capacity_kg if vehicle else 2000.0,
        bins=all_bins_data
    )

    new_route = Route(
        name=f"Anti-Gravity Emergency Route #{db.query(Route).count() + 1}",
        vehicle_id=vehicle.id if vehicle else None,
        worker_id=worker.id if worker else None,
        total_distance_km=opt["total_distance_km"],
        estimated_time_mins=opt["estimated_time_mins"],
        fuel_saved_liters=opt["fuel_saved_liters"],
        status="IN_PROGRESS",
        created_at=datetime.utcnow()
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    # Add stops
    for idx, b_item in enumerate(opt["ordered_bins"][:8]):
        db.add(
            RouteStop(
                route_id=new_route.id,
                bin_id=b_item["id"],
                stop_order=idx + 1,
                status="PENDING"
            )
        )
    db.commit()

    # Step 8, 9 & 10: Worker Collects Garbage -> Bin resets to 0% -> Collection record saved
    collected_weight = target_bin.current_weight_kg
    target_bin.current_fill_pct = 0.0
    target_bin.current_weight_kg = 2.0
    target_bin.priority = "LOW"
    target_bin.bin_health = "OPTIMAL"
    target_bin.is_overflowing = False
    target_bin.last_collection_time = datetime.utcnow()
    target_bin.updated_at = datetime.utcnow()

    collection_record = Collection(
        route_id=new_route.id,
        bin_id=target_bin.id,
        worker_id=worker.id if worker else 1,
        collected_weight_kg=collected_weight,
        proof_image="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
        notes="Automated Demo Flow Collection: Optical sensor and load cell confirm clean 0% state.",
        collected_at=datetime.utcnow()
    )
    db.add(collection_record)

    # Citizen complaint resolved
    complaint.status = "RESOLVED"

    # Worker collection alert
    success_alert = Notification(
        title=f"COLLECTION VERIFIED: {target_bin.code}",
        message=f"Smart Bin at {target_bin.location_name} successfully emptied ({collected_weight} kg collected). Fill level restored to 0%.",
        severity="INFO",
        category="COLLECTION",
        timestamp=datetime.utcnow()
    )
    db.add(success_alert)
    db.commit()

    return {
        "status": "SUCCESS",
        "demo_flow_completed": True,
        "steps": [
            {"step": 1, "title": "Citizen Complaint Lodged", "details": f"Reported overflow at {target_bin.location_name}"},
            {"step": 2, "title": "AI Image Analysis", "details": f"Detected: {ai_classification['detected_category']} ({ai_classification['confidence_pct']}% confidence)"},
            {"step": 3, "title": "Priority Escalated", "details": "Bin marked CRITICAL (98.4% Fill)"},
            {"step": 4, "title": "Admin Real-Time Notification", "details": admin_alert.title},
            {"step": 5, "title": "AI Predictive Analytics", "details": "Estimated overflow in 12 mins"},
            {"step": 6, "title": "AI Dynamic Route Recalculation", "details": f"Route #{new_route.id} created ({new_route.total_distance_km} km, {new_route.fuel_saved_liters} L fuel saved)"},
            {"step": 7, "title": "Worker Dispatch", "details": f"Assigned to {worker.employee_id if worker else 'Worker AGW-2050-1001'}"},
            {"step": 8, "title": "Garbage Collected & Proof Uploaded", "details": f"{collected_weight} kg collected with optical proof"},
            {"step": 9, "title": "Bin Reset to 0%", "details": f"{target_bin.code} fill level now 0.0%, priority LOW"},
            {"step": 10, "title": "Analytics Updated", "details": "CO2 offset, recycling metrics, and fuel savings updated"}
        ],
        "bin": {
            "id": target_bin.id,
            "code": target_bin.code,
            "fill_pct": target_bin.current_fill_pct,
            "priority": target_bin.priority
        },
        "route_id": new_route.id,
        "collection_id": collection_record.id
    }
