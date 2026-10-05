import asyncio
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import (
    auth_router, bins_router, waste_router, predictions_router,
    routes_router, complaints_router, analytics_router,
    notifications_router, vehicles_router, demo_router
)
from iot_simulator.simulator import iot_simulator

# Create tables
Base.metadata.create_all(bind=engine)

# WebSocket Connection Manager for live IoT telemetry
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Link IoT Simulator callback to WebSocket broadcaster
async def telemetry_broadcast_callback(data: dict):
    await manager.broadcast(data)

iot_simulator.set_broadcast_callback(telemetry_broadcast_callback)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start IoT Simulator in background
    sim_task = asyncio.create_task(iot_simulator.run_loop())
    print("Anti-Gravity Backend Ready with Live IoT WebSocket Engine.")
    yield
    # Shutdown simulator
    iot_simulator.stop()
    sim_task.cancel()

app = FastAPI(
    title="ANTI-GRAVITY AI Smart Garbage Management API",
    description="Futuristic Smart City Waste Management Command Center Backend (2050)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router.router)
app.include_router(bins_router.router)
app.include_router(waste_router.router)
app.include_router(predictions_router.router)
app.include_router(routes_router.router)
app.include_router(complaints_router.router)
app.include_router(analytics_router.router)
app.include_router(notifications_router.router)
app.include_router(vehicles_router.router)
app.include_router(demo_router.router)

@app.get("/")
def root():
    return {
        "system": "ANTI-GRAVITY AI SMART GARBAGE MANAGEMENT SYSTEM",
        "tagline": "Predict. Optimize. Collect. Recycle.",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "docs_url": "/docs",
        "ws_telemetry": "/ws/telemetry",
        "simulation_mode": "ACTIVE (IoT Simulator Online)"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial welcome packet
        await websocket.send_json({
            "type": "SYSTEM_CONNECTED",
            "message": "Connected to Anti-Gravity IoT Telemetry Stream",
            "status": "ONLINE"
        })
        while True:
            # Keep socket alive and receive any client ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
