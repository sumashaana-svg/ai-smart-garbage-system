from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import base64
from typing import Optional
from ..database import get_db
from ..models import WasteClassification
from ..schemas import WasteClassifyRequest, WasteClassificationOut
from ai_service.classifier import classifier_service

router = APIRouter(prefix="/waste", tags=["AI Waste Classification"])

@router.post("/classify", response_model=WasteClassificationOut)
def classify_waste_json(payload: WasteClassifyRequest, db: Session = Depends(get_db)):
    """Classify waste using computer vision feature extractor model."""
    result = classifier_service.classify_image(
        image_data=payload.image_base64 or payload.image_url or "",
        filename=payload.image_name or ""
    )
    
    # Store record
    record = WasteClassification(
        image_url=payload.image_url or "base64://embedded",
        detected_category=result["detected_category"],
        confidence_pct=result["confidence_pct"],
        is_recyclable=result["is_recyclable"],
        disposal_method=result["disposal_method"]
    )
    db.add(record)
    db.commit()

    return result

@router.post("/upload", response_model=WasteClassificationOut)
async def upload_waste_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Classify waste from uploaded multipart image file."""
    content = await file.read()
    b64_str = base64.b64encode(content).decode("utf-8")
    
    result = classifier_service.classify_image(
        image_data=b64_str,
        filename=file.filename or ""
    )

    record = WasteClassification(
        image_url=f"upload://{file.filename}",
        detected_category=result["detected_category"],
        confidence_pct=result["confidence_pct"],
        is_recyclable=result["is_recyclable"],
        disposal_method=result["disposal_method"]
    )
    db.add(record)
    db.commit()

    return result

@router.get("/categories")
def get_categories_info():
    """List all supported waste classification categories and rules."""
    return classifier_service.CATEGORIES
