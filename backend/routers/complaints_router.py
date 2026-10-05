from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint, Bin, Notification, User
from ..schemas import ComplaintCreate, ComplaintOut
from ai_service.classifier import classifier_service

router = APIRouter(prefix="/complaints", tags=["Citizen Complaints"])

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter.upper())
    return query.order_by(Complaint.created_at.desc()).all()

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    # AI Automatic category and priority estimation from complaint description & image
    ai_result = classifier_service.classify_image(
        image_data=payload.image_url or "",
        filename=payload.title
    )
    detected_cat = ai_result["detected_category"]
    
    # Priority escalation if overflow, hazard, or fire mentioned
    text_check = f"{payload.title} {payload.description}".lower()
    priority = "HIGH"
    if any(k in text_check for k in ["fire", "smoke", "hazard", "chemical", "severe overflow", "spill", "critical"]):
        priority = "CRITICAL"
    elif any(k in text_check for k in ["broken", "offline", "jammed"]):
        priority = "MEDIUM"

    # Default citizen user if not authenticated
    citizen = db.query(User).filter(User.role == "citizen").first()
    citizen_id = citizen.id if citizen else 1

    # Escalate bin priority if bin_id provided
    if payload.bin_id:
        target_bin = db.query(Bin).filter(Bin.id == payload.bin_id).first()
        if target_bin:
            if priority == "CRITICAL" or target_bin.current_fill_pct >= 85.0:
                target_bin.priority = "CRITICAL"
                target_bin.is_overflowing = True
            elif target_bin.priority == "LOW":
                target_bin.priority = "HIGH"
            target_bin.updated_at = datetime.utcnow()

    complaint = Complaint(
        citizen_id=citizen_id,
        bin_id=payload.bin_id,
        title=payload.title,
        description=payload.description,
        image_url=payload.image_url or "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        ai_category=detected_cat,
        priority=priority,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(complaint)

    # Award citizen 50 eco-points for reporting
    if citizen:
        citizen.points += 50

    # System alert
    notif = Notification(
        title=f"NEW CITIZEN COMPLAINT: {payload.title[:40]}",
        message=f"Reported at Bin ID {payload.bin_id or 'General'}. AI classified as '{detected_cat}' ({priority} Priority).",
        severity="DANGER" if priority == "CRITICAL" else "WARNING",
        category="COMPLAINT",
        timestamp=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    db.refresh(complaint)

    return complaint

@router.put("/{complaint_id}")
def update_complaint_status(
    complaint_id: int,
    status: str = Query(..., description="PENDING, INVESTIGATING, RESOLVED"),
    db: Session = Depends(get_db)
):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    c.status = status.upper()
    db.commit()
    return {"message": f"Complaint #{complaint_id} status changed to {c.status}"}
