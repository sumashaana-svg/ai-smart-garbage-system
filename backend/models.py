from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="citizen") # admin, worker, citizen
    points = Column(Integer, default=150) # eco-rewards
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    complaints = relationship("Complaint", back_populates="citizen")
    worker_profile = relationship("Worker", back_populates="user", uselist=False)

class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    location_name = Column(String(150), nullable=False)
    area = Column(String(80), nullable=False, default="Central")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Telemetry
    capacity_liters = Column(Float, default=120.0)
    current_fill_pct = Column(Float, default=20.0)
    current_weight_kg = Column(Float, default=5.0)
    temperature_c = Column(Float, default=26.5)
    gas_ppm = Column(Float, default=45.0) # MQ-2 sensor
    battery_pct = Column(Float, default=95.0)
    
    # Priority & Status
    priority = Column(String(20), default="LOW") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE
    bin_health = Column(String(20), default="OPTIMAL") # OPTIMAL, WARNING, CRITICAL
    
    # Hazard flags
    is_overflowing = Column(Boolean, default=False)
    is_fire_hazard = Column(Boolean, default=False)
    is_gas_leak = Column(Boolean, default=False)
    
    last_collection_time = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sensors = relationship("Sensor", back_populates="bin", cascade="all, delete-orphan")
    waste_records = relationship("WasteRecord", back_populates="bin")
    predictions = relationship("Prediction", back_populates="bin")
    collections = relationship("Collection", back_populates="bin")
    route_stops = relationship("RouteStop", back_populates="bin")
    complaints = relationship("Complaint", back_populates="bin")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id", ondelete="CASCADE"), nullable=False)
    sensor_type = Column(String(40), nullable=False) # ULTRASONIC, LOAD_CELL, MQ2_GAS, DHT22_TEMP, GPS
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    status = Column(String(20), default="HEALTHY") # HEALTHY, DEGRADED, FAULTY
    timestamp = Column(DateTime, default=datetime.utcnow)

    bin = relationship("Bin", back_populates="sensors")

class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    category = Column(String(50), nullable=False) # Plastic, Paper, Glass, Metal, Organic, E-waste, Hazardous, Mixed
    weight_kg = Column(Float, default=1.0)
    volume_liters = Column(Float, default=5.0)
    logged_at = Column(DateTime, default=datetime.utcnow)

    bin = relationship("Bin", back_populates="waste_records")

class WasteClassification(Base):
    __tablename__ = "waste_classifications"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=True)
    detected_category = Column(String(50), nullable=False)
    confidence_pct = Column(Float, nullable=False)
    is_recyclable = Column(Boolean, default=True)
    disposal_method = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_no = Column(String(30), unique=True, nullable=False)
    vehicle_type = Column(String(40), default="Electric Waste Pod")
    driver_name = Column(String(100), nullable=False)
    capacity_kg = Column(Float, default=1500.0)
    current_load_kg = Column(Float, default=320.0)
    fuel_pct = Column(Float, default=88.0) # or battery charge
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ON_ROUTE, MAINTENANCE
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    updated_at = Column(DateTime, default=datetime.utcnow)

    routes = relationship("Route", back_populates="vehicle")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String(40), unique=True, nullable=False)
    zone = Column(String(80), nullable=False, default="Tech Corridor Central")
    shift = Column(String(30), default="Day-A")
    status = Column(String(30), default="ACTIVE") # ACTIVE, ON_DUTY, OFF_DUTY

    user = relationship("User", back_populates="worker_profile")
    routes = relationship("Route", back_populates="worker")
    collections = relationship("Collection", back_populates="worker")

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="AI Anti-Gravity Optimization Alpha")
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    total_distance_km = Column(Float, default=0.0)
    estimated_time_mins = Column(Integer, default=0)
    fuel_saved_liters = Column(Float, default=0.0)
    status = Column(String(30), default="PENDING") # PENDING, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="routes")
    worker = relationship("Worker", back_populates="routes")
    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan")

class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    stop_order = Column(Integer, nullable=False)
    status = Column(String(30), default="PENDING") # PENDING, COLLECTED, SKIPPED
    collected_at = Column(DateTime, nullable=True)

    route = relationship("Route", back_populates="stops")
    bin = relationship("Bin", back_populates="route_stops")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    ai_category = Column(String(50), default="Mixed")
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="PENDING") # PENDING, INVESTIGATING, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("User", back_populates="complaints")
    bin = relationship("Bin", back_populates="complaints")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO") # INFO, WARNING, DANGER, CRITICAL
    category = Column(String(40), default="SYSTEM") # OVERFLOW, FIRE, GAS, BATTERY, COMPLAINT, ROUTE
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    collected_weight_kg = Column(Float, default=12.5)
    proof_image = Column(String(500), nullable=True)
    notes = Column(String(255), nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)

    bin = relationship("Bin", back_populates="collections")
    worker = relationship("Worker", back_populates="collections")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    predicted_full_time = Column(DateTime, nullable=False)
    hours_until_full = Column(Float, default=6.5)
    expected_fill_pct_24h = Column(Float, default=92.0)
    overflow_probability = Column(Float, default=0.78)
    peak_hours = Column(String(80), default="12:00 - 15:00")
    generated_at = Column(DateTime, default=datetime.utcnow)

    bin = relationship("Bin", back_populates="predictions")

class RecyclingRecord(Base):
    __tablename__ = "recycling_records"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    total_kg = Column(Float, default=0.0)
    co2_offset_kg = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
