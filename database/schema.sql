-- ==========================================================
-- ANTI-GRAVITY AI SMART GARBAGE MANAGEMENT SYSTEM
-- Relational Database DDL Schema (PostgreSQL & SQLite compatible)
-- "Predict. Optimize. Collect. Recycle."
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'citizen', -- 'admin', 'worker', 'citizen'
    points INTEGER DEFAULT 150,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Smart Bins Table
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    area VARCHAR(80) NOT NULL DEFAULT 'Central',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity_liters DOUBLE PRECISION DEFAULT 120.0,
    current_fill_pct DOUBLE PRECISION DEFAULT 20.0,
    current_weight_kg DOUBLE PRECISION DEFAULT 5.0,
    temperature_c DOUBLE PRECISION DEFAULT 26.5,
    gas_ppm DOUBLE PRECISION DEFAULT 45.0,
    battery_pct DOUBLE PRECISION DEFAULT 95.0,
    priority VARCHAR(20) DEFAULT 'LOW', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    status VARCHAR(20) DEFAULT 'ONLINE', -- 'ONLINE', 'OFFLINE', 'MAINTENANCE'
    bin_health VARCHAR(20) DEFAULT 'OPTIMAL',
    is_overflowing BOOLEAN DEFAULT FALSE,
    is_fire_hazard BOOLEAN DEFAULT FALSE,
    is_gas_leak BOOLEAN DEFAULT FALSE,
    last_collection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sensors Table
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    sensor_type VARCHAR(40) NOT NULL, -- ULTRASONIC, LOAD_CELL, MQ2_GAS, DHT22_TEMP, GPS, BATTERY
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'HEALTHY',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Waste Records Table
CREATE TABLE IF NOT EXISTS waste_records (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER NOT NULL REFERENCES bins(id),
    category VARCHAR(50) NOT NULL, -- Plastic, Paper, Glass, Metal, Organic, E-waste, Hazardous, Mixed
    weight_kg DOUBLE PRECISION DEFAULT 1.0,
    volume_liters DOUBLE PRECISION DEFAULT 5.0,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Waste Classifications Table
CREATE TABLE IF NOT EXISTS waste_classifications (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500),
    detected_category VARCHAR(50) NOT NULL,
    confidence_pct DOUBLE PRECISION NOT NULL,
    is_recyclable BOOLEAN DEFAULT TRUE,
    disposal_method TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_no VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(40) DEFAULT 'Electric Waste Pod',
    driver_name VARCHAR(100) NOT NULL,
    capacity_kg DOUBLE PRECISION DEFAULT 1500.0,
    current_load_kg DOUBLE PRECISION DEFAULT 320.0,
    fuel_pct DOUBLE PRECISION DEFAULT 88.0,
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    latitude DOUBLE PRECISION DEFAULT 12.9716,
    longitude DOUBLE PRECISION DEFAULT 77.5946,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    employee_id VARCHAR(40) UNIQUE NOT NULL,
    zone VARCHAR(80) NOT NULL DEFAULT 'Tech Corridor Central',
    shift VARCHAR(30) DEFAULT 'Day-A',
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

-- 8. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'AI Optimization Alpha',
    vehicle_id INTEGER REFERENCES vehicles(id),
    worker_id INTEGER REFERENCES workers(id),
    total_distance_km DOUBLE PRECISION DEFAULT 0.0,
    estimated_time_mins INTEGER DEFAULT 0,
    fuel_saved_liters DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Route Stops Table
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bin_id INTEGER NOT NULL REFERENCES bins(id),
    stop_order INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    collected_at TIMESTAMP
);

-- 10. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    citizen_id INTEGER NOT NULL REFERENCES users(id),
    bin_id INTEGER REFERENCES bins(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    ai_category VARCHAR(50) DEFAULT 'Mixed',
    priority VARCHAR(20) DEFAULT 'HIGH',
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    category VARCHAR(40) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Collections Table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    bin_id INTEGER NOT NULL REFERENCES bins(id),
    worker_id INTEGER REFERENCES workers(id),
    collected_weight_kg DOUBLE PRECISION DEFAULT 12.5,
    proof_image VARCHAR(500),
    notes VARCHAR(255),
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER NOT NULL REFERENCES bins(id),
    predicted_full_time TIMESTAMP NOT NULL,
    hours_until_full DOUBLE PRECISION DEFAULT 6.5,
    expected_fill_pct_24h DOUBLE PRECISION DEFAULT 92.0,
    overflow_probability DOUBLE PRECISION DEFAULT 0.78,
    peak_hours VARCHAR(80) DEFAULT '12:00 - 15:00',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Recycling Records Table
CREATE TABLE IF NOT EXISTS recycling_records (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    total_kg DOUBLE PRECISION DEFAULT 0.0,
    co2_offset_kg DOUBLE PRECISION DEFAULT 0.0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast real-time queries
CREATE INDEX IF NOT EXISTS idx_bins_priority ON bins(priority);
CREATE INDEX IF NOT EXISTS idx_bins_status ON bins(status);
CREATE INDEX IF NOT EXISTS idx_sensors_bin_id ON sensors(bin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
