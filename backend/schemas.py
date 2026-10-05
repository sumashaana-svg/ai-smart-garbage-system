from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "citizen"
    phone: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    points: int
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- SENSOR & TELEMETRY SCHEMAS ---
class SensorReading(BaseModel):
    sensor_type: str
    value: float
    unit: str
    status: Optional[str] = "HEALTHY"

class BinTelemetryUpdate(BaseModel):
    current_fill_pct: Optional[float] = None
    current_weight_kg: Optional[float] = None
    temperature_c: Optional[float] = None
    gas_ppm: Optional[float] = None
    battery_pct: Optional[float] = None
    status: Optional[str] = None
    is_fire_hazard: Optional[bool] = None
    is_overflowing: Optional[bool] = None
    is_gas_leak: Optional[bool] = None

# --- BIN SCHEMAS ---
class BinCreate(BaseModel):
    code: str
    location_name: str
    area: str
    latitude: float
    longitude: float
    capacity_liters: Optional[float] = 120.0
    priority: Optional[str] = "LOW"

class BinUpdate(BaseModel):
    location_name: Optional[str] = None
    area: Optional[str] = None
    capacity_liters: Optional[float] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class BinOut(BaseModel):
    id: int
    code: str
    location_name: str
    area: str
    latitude: float
    longitude: float
    capacity_liters: float
    current_fill_pct: float
    current_weight_kg: float
    temperature_c: float
    gas_ppm: float
    battery_pct: float
    priority: str
    status: str
    bin_health: str
    is_overflowing: bool
    is_fire_hazard: bool
    is_gas_leak: bool
    last_collection_time: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- AI WASTE CLASSIFICATION SCHEMAS ---
class WasteClassifyRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    image_name: Optional[str] = None

class WasteClassificationOut(BaseModel):
    detected_category: str
    confidence_pct: float
    is_recyclable: bool
    disposal_method: str
    hazard_level: str
    material_breakdown: dict
    timestamp: datetime

# --- PREDICTION SCHEMAS ---
class PredictionOut(BaseModel):
    id: int
    bin_id: int
    predicted_full_time: datetime
    hours_until_full: float
    expected_fill_pct_24h: float
    overflow_probability: float
    peak_hours: str
    generated_at: datetime

    class Config:
        from_attributes = True

class GeneratePredictionRequest(BaseModel):
    bin_id: int

# --- ROUTE SCHEMAS ---
class RouteOptimizeRequest(BaseModel):
    vehicle_id: Optional[int] = None
    worker_id: Optional[int] = None
    max_bins: Optional[int] = 10
    include_high_priority_only: Optional[bool] = False

class RouteStopOut(BaseModel):
    id: int
    bin_id: int
    stop_order: int
    status: str
    bin: Optional[BinOut] = None

    class Config:
        from_attributes = True

class RouteOut(BaseModel):
    id: int
    name: str
    vehicle_id: Optional[int]
    worker_id: Optional[int]
    total_distance_km: float
    estimated_time_mins: int
    fuel_saved_liters: float
    status: str
    created_at: datetime
    stops: List[RouteStopOut] = []

    class Config:
        from_attributes = True

# --- COMPLAINT SCHEMAS ---
class ComplaintCreate(BaseModel):
    bin_id: Optional[int] = None
    title: str
    description: str
    image_url: Optional[str] = None
    location_text: Optional[str] = None
    ai_category: Optional[str] = "Mixed"

class ComplaintOut(BaseModel):
    id: int
    citizen_id: int
    bin_id: Optional[int]
    title: str
    description: str
    image_url: Optional[str]
    ai_category: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- NOTIFICATION SCHEMAS ---
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    category: str
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# --- COLLECTION SCHEMAS ---
class CollectionCreate(BaseModel):
    bin_id: int
    collected_weight_kg: float
    proof_image: Optional[str] = None
    notes: Optional[str] = None
    route_id: Optional[int] = None

class CollectionOut(BaseModel):
    id: int
    bin_id: int
    worker_id: Optional[int]
    collected_weight_kg: float
    proof_image: Optional[str]
    notes: Optional[str]
    collected_at: datetime

    class Config:
        from_attributes = True

# --- VEHICLE SCHEMAS ---
class VehicleOut(BaseModel):
    id: int
    vehicle_no: str
    vehicle_type: str
    driver_name: str
    capacity_kg: float
    current_load_kg: float
    fuel_pct: float
    status: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True
