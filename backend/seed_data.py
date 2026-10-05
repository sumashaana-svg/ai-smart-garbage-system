import random
from datetime import datetime, timedelta
from .database import SessionLocal, Base, engine
from .models import (
    User, Bin, Sensor, WasteRecord, WasteClassification,
    Vehicle, Worker, Route, RouteStop, Complaint, Notification,
    Collection, Prediction, RecyclingRecord
)
from .auth import get_password_hash

# Coordinates centered in Bengaluru Smart City Tech Corridor
BENGALURU_LOCATIONS = [
    ("MG Road Metro Station North Gate", "MG Road / Central", 12.9754, 77.6066),
    ("Brigade Road Commercial Promenade", "MG Road / Central", 12.9719, 77.6070),
    ("Cubbon Park Eco Corridor Gate 3", "Central Eco-Zone", 12.9763, 77.5929),
    ("Indiranagar 100ft Road Food Hub", "Indiranagar", 12.9712, 77.6412),
    ("Indiranagar Double Road Cafe Hub", "Indiranagar", 12.9645, 77.6433),
    ("Koramangala 4th Block Wipro Park", "Koramangala", 12.9344, 77.6272),
    ("Koramangala 5th Block Startup Hub", "Koramangala", 12.9352, 77.6189),
    ("Koramangala Sony World Junction", "Koramangala", 12.9378, 77.6245),
    ("HSR Layout Sector 1 Park Arena", "HSR Layout", 12.9116, 77.6389),
    ("HSR Layout 27th Main Commercial", "HSR Layout", 12.9150, 77.6502),
    ("HSR BDA Complex Plaza", "HSR Layout", 12.9168, 77.6445),
    ("Whitefield ITPL Main Concourse", "Whitefield", 12.9856, 77.7289),
    ("Whitefield Nexus Mall Outer Ring", "Whitefield", 12.9912, 77.7180),
    ("Whitefield ECC Road Transit Hub", "Whitefield", 12.9780, 77.7420),
    ("Electronic City Phase 1 Infosys Gate", "Electronic City", 12.8452, 77.6602),
    ("Electronic City Phase 2 Cyber Zone", "Electronic City", 12.8398, 77.6781),
    ("Electronic City Wipro Avenue", "Electronic City", 12.8480, 77.6650),
    ("Bellandur EcoSpace Tech Park Hub", "Outer Ring Road", 12.9260, 77.6830),
    ("Outer Ring Road Marathahalli Bridge", "Marathahalli", 12.9555, 77.7010),
    ("Marathahalli Innovative Multiplex", "Marathahalli", 12.9510, 77.6980),
    ("JP Nagar 6th Phase Cultural Center", "JP Nagar", 12.9063, 77.5855),
    ("JP Nagar Mini Forest Eco Pavilion", "JP Nagar", 12.9120, 77.5940),
    ("Jayanagar 4th Block Shopping Complex", "Jayanagar", 12.9298, 77.5834),
    ("Malleshwaram 8th Cross Traditional Market", "Malleshwaram", 12.9982, 77.5711),
    ("Malleshwaram Sankey Tank Promenade", "Malleshwaram", 13.0075, 77.5742),
    ("Hebbal Flyover Transit Plaza", "Hebbal", 13.0358, 77.5970),
    ("Manyata Tech Park North Gate 4", "Nagavara / Manyata", 13.0475, 77.6210),
    ("Nagavara Outer Ring Road Bus Depot", "Nagavara", 13.0420, 77.6180),
    ("BTM Layout 2nd Stage Udupi Garden", "BTM Layout", 12.9160, 77.6101),
    ("Banashankari Temple Main Complex", "Banashankari", 12.9255, 77.5738)
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Bin).count() >= 30:
        print("Database already populated with demo data.")
        db.close()
        return

    print("Populating Smart Waste Management Database...")

    # 1. USERS: Admin, Workers (10), Citizens (20)
    users = []
    
    # Primary Admin
    admin = User(
        name="Chief Commander Vikram Rao",
        email="admin@antigravity.city",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        points=1500,
        phone="+91-9880011221"
    )
    users.append(admin)

    # 10 Workers
    worker_names = [
        ("Rajesh Kumar", "rajesh.k@antigravity.city"),
        ("Suresh Nair", "suresh.n@antigravity.city"),
        ("Arun Gowda", "arun.g@antigravity.city"),
        ("Manoj Patil", "manoj.p@antigravity.city"),
        ("Deepak Sharma", "deepak.s@antigravity.city"),
        ("Ramesh Hegde", "ramesh.h@antigravity.city"),
        ("Anand Verma", "anand.v@antigravity.city"),
        ("Karthik Reddy", "karthik.r@antigravity.city"),
        ("Mohan Das", "mohan.d@antigravity.city"),
        ("Girish Murthy", "worker@antigravity.city") # default worker login
    ]

    worker_users = []
    for name, email in worker_names:
        u = User(
            name=name,
            email=email,
            hashed_password=get_password_hash("worker123"),
            role="worker",
            points=420,
            phone=f"+91-9900{random.randint(100000, 999999)}"
        )
        users.append(u)
        worker_users.append(u)

    # 20 Citizens
    citizen_names = [
        ("Aarav Mehta", "citizen@antigravity.city"), # default citizen login
        ("Priya Sundaram", "priya.s@gmail.com"),
        ("Rohan Iyer", "rohan.i@outlook.com"),
        ("Ananya Deshmukh", "ananya.d@gmail.com"),
        ("Sneha Kulkarni", "sneha.k@yahoo.com"),
        ("Rahul Nambiar", "rahul.n@gmail.com"),
        ("Divya Balan", "divya.b@hotmail.com"),
        ("Aditya Swaminathan", "aditya.s@gmail.com"),
        ("Pooja Hegde", "pooja.h@gmail.com"),
        ("Kavita Menon", "kavita.m@gmail.com"),
        ("Varun Joshi", "varun.j@gmail.com"),
        ("Neha Saxena", "neha.s@gmail.com"),
        ("Siddharth Roy", "sid.roy@gmail.com"),
        ("Meera Sen", "meera.sen@gmail.com"),
        ("Naveen Prasad", "naveen.p@gmail.com"),
        ("Tanvi Bhat", "tanvi.b@gmail.com"),
        ("Gautam Singhania", "gautam.s@gmail.com"),
        ("Ritu Chawla", "ritu.c@gmail.com"),
        ("Harish Reddy", "harish.r@gmail.com"),
        ("Shreya Mukherjee", "shreya.m@gmail.com")
    ]

    citizen_users = []
    for name, email in citizen_names:
        u = User(
            name=name,
            email=email,
            hashed_password=get_password_hash("citizen123"),
            role="citizen",
            points=random.randint(100, 850),
            phone=f"+91-9845{random.randint(100000, 999999)}"
        )
        users.append(u)
        citizen_users.append(u)

    db.add_all(users)
    db.commit()

    # 2. WORKERS PROFILE
    workers = []
    zones = ["Central Zone", "Indiranagar Tech Ring", "Koramangala Hub", "Whitefield Outer Ring", "Electronic City Zone"]
    for i, wu in enumerate(worker_users):
        w = Worker(
            user_id=wu.id,
            employee_id=f"AGW-2050-{1001 + i}",
            zone=zones[i % len(zones)],
            shift="Day-A" if i % 2 == 0 else "Night-B",
            status="ACTIVE"
        )
        workers.append(w)
    db.add_all(workers)
    db.commit()

    # 3. VEHICLES (5 Smart Fleet Trucks)
    vehicles_data = [
        ("AG-TRUCK-01", "Cyber Hauler Alpha", "Ramesh Gowda", 2000.0, 480.0, 92.0, "AVAILABLE", 12.9716, 77.5946),
        ("AG-TRUCK-02", "Cyber Hauler Beta", "Mahesh Kumar", 2000.0, 720.0, 85.0, "ON_ROUTE", 12.9344, 77.6272),
        ("AG-TRUCK-03", "Autonomous Electric Pod 1", "AI Pilot Nav", 1200.0, 310.0, 78.0, "AVAILABLE", 12.9856, 77.7289),
        ("AG-TRUCK-04", "Heavy Waste Compactor 04", "Sunil Shinde", 3500.0, 1150.0, 95.0, "AVAILABLE", 12.8452, 77.6602),
        ("AG-TRUCK-05", "Hazard & Rapid Response Pod", "Kiran Varma", 1000.0, 150.0, 89.0, "AVAILABLE", 12.9982, 77.5711)
    ]
    vehicles = []
    for vno, vtype, driver, cap, load, fuel, status, lat, lng in vehicles_data:
        v = Vehicle(
            vehicle_no=vno,
            vehicle_type=vtype,
            driver_name=driver,
            capacity_kg=cap,
            current_load_kg=load,
            fuel_pct=fuel,
            status=status,
            latitude=lat,
            longitude=lng
        )
        vehicles.append(v)
    db.add_all(vehicles)
    db.commit()

    # 4. 30 SMART DUSTBINS with realistic sensors & priorities
    bins = []
    for i, (loc_name, area, lat, lng) in enumerate(BENGALURU_LOCATIONS):
        code = f"AG-BIN-{101 + i}"
        
        # Give diverse fill levels:
        # A few CRITICAL (>90%), several HIGH (80-90%), MEDIUM (50-80%), and LOW (<50%)
        if i in [3, 7, 11, 23]:
            fill = random.uniform(91.0, 98.5)
            priority = "CRITICAL"
            is_overflow = True
            is_fire = False
            is_gas = False
            gas_ppm = random.uniform(110.0, 240.0) # High organic decay
            weight = random.uniform(35.0, 48.0)
            health = "CRITICAL"
        elif i in [1, 5, 8, 14, 18]:
            fill = random.uniform(81.0, 89.5)
            priority = "HIGH"
            is_overflow = False
            is_fire = False
            is_gas = False
            gas_ppm = random.uniform(60.0, 95.0)
            weight = random.uniform(25.0, 34.0)
            health = "WARNING"
        elif i in [0, 4, 9, 12, 16, 20, 25]:
            fill = random.uniform(52.0, 78.0)
            priority = "MEDIUM"
            is_overflow = False
            is_fire = False
            is_gas = False
            gas_ppm = random.uniform(35.0, 58.0)
            weight = random.uniform(15.0, 24.0)
            health = "OPTIMAL"
        elif i == 17: # Simulated hazard bin
            fill = 72.0
            priority = "CRITICAL"
            is_overflow = False
            is_fire = True
            is_gas = True
            gas_ppm = 480.0
            weight = 22.0
            health = "CRITICAL"
        else:
            fill = random.uniform(12.0, 48.0)
            priority = "LOW"
            is_overflow = False
            is_fire = False
            is_gas = False
            gas_ppm = random.uniform(18.0, 38.0)
            weight = random.uniform(4.0, 14.0)
            health = "OPTIMAL"

        smart_bin = Bin(
            code=code,
            location_name=loc_name,
            area=area,
            latitude=lat,
            longitude=lng,
            capacity_liters=120.0,
            current_fill_pct=round(fill, 1),
            current_weight_kg=round(weight, 1),
            temperature_c=round(random.uniform(24.5, 34.0), 1),
            gas_ppm=round(gas_ppm, 1),
            battery_pct=round(random.uniform(72.0, 100.0), 1),
            priority=priority,
            status="ONLINE" if i != 28 else "MAINTENANCE",
            bin_health=health,
            is_overflowing=is_overflow,
            is_fire_hazard=is_fire,
            is_gas_leak=is_gas,
            last_collection_time=datetime.utcnow() - timedelta(hours=random.randint(2, 48))
        )
        bins.append(smart_bin)

    db.add_all(bins)
    db.commit()

    # 5. SENSORS (Ultrasonic, Load Cell, MQ-2 Gas, DHT22 Temp, GPS for each bin)
    sensors = []
    for b in bins:
        sensors.append(Sensor(bin_id=b.id, sensor_type="ULTRASONIC", value=b.current_fill_pct, unit="%"))
        sensors.append(Sensor(bin_id=b.id, sensor_type="LOAD_CELL", value=b.current_weight_kg, unit="kg"))
        sensors.append(Sensor(bin_id=b.id, sensor_type="MQ2_GAS", value=b.gas_ppm, unit="ppm"))
        sensors.append(Sensor(bin_id=b.id, sensor_type="DHT22_TEMP", value=b.temperature_c, unit="°C"))
        sensors.append(Sensor(bin_id=b.id, sensor_type="BATTERY", value=b.battery_pct, unit="%"))
    db.add_all(sensors)
    db.commit()

    # 6. 100 WASTE RECORDS across categories
    categories = ["Plastic", "Paper", "Glass", "Metal", "Organic", "E-waste", "Hazardous waste", "Mixed waste"]
    waste_records = []
    now = datetime.utcnow()
    for _ in range(120):
        b = random.choice(bins)
        cat = random.choice(categories)
        w = round(random.uniform(0.5, 8.5), 2)
        v = round(w * random.uniform(1.5, 4.0), 1)
        logged = now - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))
        waste_records.append(WasteRecord(bin_id=b.id, category=cat, weight_kg=w, volume_liters=v, logged_at=logged))
    db.add_all(waste_records)
    db.commit()

    # 7. 50 COLLECTION RECORDS
    collections = []
    for _ in range(55):
        b = random.choice(bins)
        w = random.choice(workers)
        collected_at = now - timedelta(days=random.randint(0, 10), hours=random.randint(1, 20))
        collections.append(
            Collection(
                bin_id=b.id,
                worker_id=w.id,
                collected_weight_kg=round(random.uniform(12.0, 38.0), 1),
                proof_image="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
                notes="Biometric verified smart collection completed.",
                collected_at=collected_at
            )
        )
    db.add_all(collections)
    db.commit()

    # 8. 20 CITIZEN COMPLAINTS
    complaints = []
    complaint_titles = [
        ("Severe overflow spilling onto pedestrian walk", "CRITICAL", "Mixed waste"),
        ("Smoke and burning plastic smell emanating from bin", "CRITICAL", "Hazardous waste"),
        ("Plastic bottles overflowing after community weekend event", "HIGH", "Plastic"),
        ("Damaged smart lid sensor not opening automatically", "MEDIUM", "Mixed waste"),
        ("E-waste discarded in general dustbin", "HIGH", "E-waste"),
        ("Illegal dumping of carton boxes outside smart pod", "HIGH", "Paper"),
        ("Organic waste bin lid jammed in hot afternoon", "HIGH", "Organic"),
        ("Glass bottles shattered near children play zone", "CRITICAL", "Glass"),
        ("Bin battery indicator flashing red offline", "MEDIUM", "Mixed waste"),
        ("Commercial beverage cans piled around smart dustbin", "HIGH", "Metal")
    ]
    for i in range(22):
        c_title, c_prio, c_cat = complaint_titles[i % len(complaint_titles)]
        c_user = random.choice(citizen_users)
        c_bin = random.choice(bins)
        status = "PENDING" if i < 10 else ("INVESTIGATING" if i < 16 else "RESOLVED")
        complaints.append(
            Complaint(
                citizen_id=c_user.id,
                bin_id=c_bin.id,
                title=f"{c_title} @ {c_bin.code}",
                description=f"Citizen detected anomaly at {c_bin.location_name}. Requesting priority dispatch.",
                image_url="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
                ai_category=c_cat,
                priority=c_prio,
                status=status,
                created_at=now - timedelta(hours=random.randint(1, 72))
            )
        )
    db.add_all(complaints)
    db.commit()

    # 9. AI PREDICTIONS for all bins
    predictions = []
    for b in bins:
        hrs = max(1.2, round((100.0 - b.current_fill_pct) / 4.8, 1))
        overflow_p = min(0.99, round(b.current_fill_pct / 100.0 * 1.05, 2))
        predictions.append(
            Prediction(
                bin_id=b.id,
                predicted_full_time=now + timedelta(hours=hrs),
                hours_until_full=hrs,
                expected_fill_pct_24h=min(100.0, round(b.current_fill_pct + 32.0, 1)),
                overflow_probability=overflow_p,
                peak_hours="12:00 - 14:30 & 18:30 - 21:00",
                generated_at=now
            )
        )
    db.add_all(predictions)
    db.commit()

    # 10. RECYCLING RECORDS
    recycling = [
        RecyclingRecord(category="Plastic", total_kg=4820.5, co2_offset_kg=7230.7),
        RecyclingRecord(category="Paper", total_kg=3210.0, co2_offset_kg=2568.0),
        RecyclingRecord(category="Glass", total_kg=1950.2, co2_offset_kg=585.0),
        RecyclingRecord(category="Metal", total_kg=2890.4, co2_offset_kg=8093.1),
        RecyclingRecord(category="Organic", total_kg=6450.0, co2_offset_kg=3225.0),
        RecyclingRecord(category="E-waste", total_kg=890.5, co2_offset_kg=3740.1)
    ]
    db.add_all(recycling)
    db.commit()

    # 11. NOTIFICATIONS
    notifications = [
        Notification(title="CRITICAL HAZARD: Fire/Thermal Spike", message="Bin AG-BIN-118 recorded 480 ppm gas and temp alert.", severity="CRITICAL", category="FIRE"),
        Notification(title="OVERFLOW DETECTED: AG-BIN-104", message="Ultrasonic sensor reached 96.8% at Indiranagar 100ft Rd.", severity="DANGER", category="OVERFLOW"),
        Notification(title="AI Route Optimization Dispatched", message="Fleet Truck AG-TRUCK-01 assigned new dynamic 8-bin route.", severity="INFO", category="ROUTE"),
        Notification(title="Citizen Complaint Lodged", message="New photo report for illegal dumping at Koramangala 5th Block.", severity="WARNING", category="COMPLAINT"),
        Notification(title="Battery Low Alert", message="Bin AG-BIN-129 telemetry dropped to 18% reserve charge.", severity="WARNING", category="BATTERY")
    ]
    db.add_all(notifications)
    db.commit()

    # 12. SAMPLE INITIAL OPTIMIZED ROUTE with stops
    sample_route = Route(
        name="Dynamic Anti-Gravity Priority Sweep 01",
        vehicle_id=vehicles[0].id,
        worker_id=workers[0].id,
        total_distance_km=14.8,
        estimated_time_mins=48,
        fuel_saved_liters=4.2,
        status="IN_PROGRESS"
    )
    db.add(sample_route)
    db.commit()

    # Add stops for top critical bins
    crit_bins = [b for b in bins if b.priority == "CRITICAL"][:5]
    for idx, cb in enumerate(crit_bins):
        db.add(RouteStop(route_id=sample_route.id, bin_id=cb.id, stop_order=idx + 1, status="PENDING"))
    db.commit()

    db.close()
    print("Database seeding completed successfully! All 14 tables populated.")

if __name__ == "__main__":
    seed_database()
