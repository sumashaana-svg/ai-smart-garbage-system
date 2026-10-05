from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification
from ..schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    return db.query(Notification).order_by(Notification.timestamp.desc()).limit(limit).all()

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.post("/broadcast")
def broadcast_custom_alert(
    title: str,
    message: str,
    severity: str = "WARNING",
    category: str = "SYSTEM",
    db: Session = Depends(get_db)
):
    alert = Notification(
        title=title,
        message=message,
        severity=severity.upper(),
        category=category.upper(),
        timestamp=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
