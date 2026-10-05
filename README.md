# AI Smart Garbage & Waste Management System

A smart city waste management platform powered by AI, IoT telemetry, and real-time route optimization.

## Features
- **Smart Bin Telemetry & IoT Simulation**: Real-time fill levels, battery levels, temperature, and status updates.
- **AI-Powered Route Optimization & Classification**: Dynamic collection route generation based on fill thresholds.
- **Role-Based Portals**:
  - **Citizen Portal**: Report issues, track nearby bins, earn eco-points.
  - **Driver/Worker Portal**: View assigned routes, live navigation, and mark bin pickups.
  - **Admin Command Center**: City-wide heatmaps, real-time analytics, fleet management, and predictive dispatch.
- **FastAPI Backend & React (Vite + TypeScript) Frontend**.

## Technical Architecture & Design

### Error Boundaries (Frontend)
To ensure the UI remains resilient and fails gracefully, the React frontend implements an **ErrorBoundary** component (`frontend/src/components/ErrorBoundary.tsx`). 
- Wraps the root `<App />` component to catch runtime JavaScript errors anywhere in the component tree.
- Displays a custom "SYSTEM FAILURE" fallback UI instead of crashing the entire application or showing a blank screen.
- Logs uncaught exceptions to the console for debugging while providing users a "REBOOT INTERFACE" action to recover.

### Unit Testing (Backend)
The backend test suite (`tests/test_api.py`) ensures API robustness and correctness using the standard `unittest` framework combined with FastAPI's `TestClient`.
- **Health Checks**: Asserts operational status and versioning on the root endpoint.
- **Authentication**: Verifies JWT-based login for admin, worker, and citizen roles.
- **Telemetry & Spatial Queries**: Tests endpoints for fetching nearby bins using geospatial calculations (Haversine formula).
- **AI Integration**: Validates the mock AI image classifier (detecting materials like Metal, Plastic) and predictive models (forecasting fill-up time).
- **Optimization Algorithms**: Tests dynamic route generation logic for optimal fuel efficiency and capacity constraints.
To run the tests: `pytest tests/test_api.py -v`

## API Endpoints

The FastAPI backend exposes the following primary REST endpoints (and a WebSocket):

- `GET /` - System health check and metadata.
- **Auth**:
  - `POST /auth/login` - Authenticate and receive a JWT access token.
- **Bins & IoT**:
  - `GET /bins` - Retrieve all bins and their current status.
  - `GET /bins/critical` - Fetch bins exceeding the overflow threshold.
  - `GET /bins/nearby?lat={lat}&lng={lng}&radius_km={r}` - Geospatial search for nearby bins.
- **AI Services**:
  - `POST /waste/classify` - Classify waste from an uploaded image.
  - `GET /predictions/bin/{bin_id}` - Forecast hours until bin overflow.
  - `POST /routes/optimize` - Generate optimal collection route based on current bin fill levels.
- **Dashboards**:
  - `GET /analytics/dashboard` - Get high-level system metrics (total bins, recycling %, fuel saved).
  - `GET /complaints` - Fetch citizen-reported issues.
- **Real-Time Data**:
  - `WS /ws/telemetry` - WebSocket endpoint broadcasting live IoT sensor data updates.

## Database Schema

The system uses a relational database (SQLite via SQLAlchemy) with the following core entities:

- **Users**: Manages role-based authentication (`admin`, `worker`, `citizen`) and citizen eco-points.
- **Bins**: Represents physical smart bins, storing geolocation (`lat`, `lng`), capacity, and current sensor metrics (fill %, weight, temperature, battery).
- **Vehicles & Workers**: Tracks collection fleet assets and assigned drivers.
- **Routes & RouteStops**: Stores generated collection paths linking vehicles, workers, and an ordered list of bin stops.
- **Complaints**: User-generated reports of full bins or damage, linking back to the reporting citizen and the targeted bin.
- **WasteClassifications & Predictions**: Historical records of AI classifications and predictive analytics runs.
