import asyncio
import random
from datetime import datetime
from typing import Callable, Optional
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Bin, Sensor, Notification

class IoTSimulator:
    """
    Simulates real-world smart dustbin IoT sensor telemetry:
    - Ultrasonic distance sensor (HC-SR04) -> Fill %
    - Load cell sensor (HX711) -> Weight (kg)
    - MQ-2 gas/smoke sensor -> ppm
    - DHT22 temperature sensor -> °C
    - Battery voltage monitor -> %
    """

    def __init__(self, update_interval_secs: float = 4.0):
        self.interval = update_interval_secs
        self.is_running = False
        self.broadcast_callback: Optional[Callable] = None

    def set_broadcast_callback(self, callback: Callable):
        self.broadcast_callback = callback

    def step(self, db: Session):
        """Perform one simulation tick over random smart bins."""
        bins = db.query(Bin).all()
        if not bins:
            return []

        # Select 3-6 random bins to simulate telemetry updates
        active_sample = random.sample(bins, min(5, len(bins)))
        updates = []

        for b in active_sample:
            # Fluctuate fill level (mostly upward, occasional drop simulating mini compaction)
            delta_fill = random.uniform(-0.5, 2.5)
            new_fill = max(0.0, min(100.0, round(b.current_fill_pct + delta_fill, 1)))
            b.current_fill_pct = new_fill

            # Correlate weight with fill %
            b.current_weight_kg = round(max(2.0, (new_fill / 100.0) * (b.capacity_liters * 0.35) + random.uniform(-1.0, 1.0)), 1)
            
            # Subtle temp variations
            b.temperature_c = round(max(20.0, min(45.0, b.temperature_c + random.uniform(-0.4, 0.4))), 1)
            
            # Gas sensor reading (elevated if fill is high due to organic decomposition)
            base_gas = 30.0 + (new_fill * 0.8)
            b.gas_ppm = round(base_gas + random.uniform(-5.0, 10.0), 1)

            # Battery slow drain
            b.battery_pct = round(max(10.0, b.battery_pct - 0.02), 1)

            # Assign Priority according to Project Rules:
            # CRITICAL – overflow imminent (>90%)
            # HIGH – above 80%
            # MEDIUM – 50–80%
            # LOW – below 50%
            old_priority = b.priority
            if b.current_fill_pct >= 90.0 or b.is_fire_hazard:
                b.priority = "CRITICAL"
                b.bin_health = "CRITICAL"
                b.is_overflowing = True
            elif b.current_fill_pct >= 80.0:
                b.priority = "HIGH"
                b.bin_health = "WARNING"
                b.is_overflowing = False
            elif b.current_fill_pct >= 50.0:
                b.priority = "MEDIUM"
                b.bin_health = "OPTIMAL"
                b.is_overflowing = False
            else:
                b.priority = "LOW"
                b.bin_health = "OPTIMAL"
                b.is_overflowing = False

            # Generate alert on state escalation
            if old_priority != "CRITICAL" and b.priority == "CRITICAL":
                alert = Notification(
                    title=f"CRITICAL OVERFLOW ALERT: {b.code}",
                    message=f"Smart Bin at {b.location_name} reached {b.current_fill_pct}% capacity. Immediate collection required.",
                    severity="CRITICAL",
                    category="OVERFLOW",
                    timestamp=datetime.utcnow()
                )
                db.add(alert)

            b.updated_at = datetime.utcnow()

            # Record sensor history
            db.add(Sensor(bin_id=b.id, sensor_type="ULTRASONIC", value=b.current_fill_pct, unit="%"))
            db.add(Sensor(bin_id=b.id, sensor_type="MQ2_GAS", value=b.gas_ppm, unit="ppm"))

            updates.append({
                "type": "BIN_TELEMETRY",
                "is_simulation": True,
                "bin_id": b.id,
                "code": b.code,
                "location_name": b.location_name,
                "fill_pct": b.current_fill_pct,
                "weight_kg": b.current_weight_kg,
                "temperature_c": b.temperature_c,
                "gas_ppm": b.gas_ppm,
                "battery_pct": b.battery_pct,
                "priority": b.priority,
                "bin_health": b.bin_health,
                "is_overflowing": b.is_overflowing,
                "timestamp": datetime.utcnow().isoformat()
            })

        db.commit()
        return updates

    async def run_loop(self):
        """Async background loop for continuous live WebSocket broadcast."""
        self.is_running = True
        print(f"IoT Telemetry Simulator started (Tick interval: {self.interval}s)")
        while self.is_running:
            db = SessionLocal()
            try:
                updates = self.step(db)
                if self.broadcast_callback and updates:
                    for upd in updates:
                        await self.broadcast_callback(upd)
            except Exception as e:
                print(f"IoT Simulator loop error: {e}")
            finally:
                db.close()
            await asyncio.sleep(self.interval)

    def stop(self):
        self.is_running = False

iot_simulator = IoTSimulator(update_interval_secs=4.0)

if __name__ == "__main__":
    print("Running Standalone IoT Simulator...")
    db = SessionLocal()
    for tick in range(5):
        res = iot_simulator.step(db)
        print(f"[DEMO/SIMULATION Tick {tick+1}] Updated {len(res)} bins.")
    db.close()
