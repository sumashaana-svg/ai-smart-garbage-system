import unittest
from fastapi.testclient import TestClient
from backend.main import app

class TestAntiGravityAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_health(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OPERATIONAL")
        self.assertIn("ANTI-GRAVITY", data["system"])

    def test_auth_login_admin(self):
        response = self.client.post("/auth/login", json={
            "email": "admin@antigravity.city",
            "password": "admin123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "admin")

    def test_auth_login_citizen(self):
        response = self.client.post("/auth/login", json={
            "email": "citizen@antigravity.city",
            "password": "citizen123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["role"], "citizen")

    def test_get_bins(self):
        response = self.client.get("/bins")
        self.assertEqual(response.status_code, 200)
        bins = response.json()
        self.assertGreaterEqual(len(bins), 30)

    def test_get_critical_bins(self):
        response = self.client.get("/bins/critical")
        self.assertEqual(response.status_code, 200)
        critical = response.json()
        self.assertIsInstance(critical, list)

    def test_nearby_bins(self):
        response = self.client.get("/bins/nearby?lat=12.9716&lng=77.5946&radius_km=15")
        self.assertEqual(response.status_code, 200)
        nearby = response.json()
        self.assertGreater(len(nearby), 0)

    def test_ai_waste_classification(self):
        response = self.client.post("/waste/classify", json={
            "image_name": "crushed_soda_aluminum_can.jpg"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["detected_category"], "Metal")
        self.assertTrue(data["is_recyclable"])
        self.assertGreater(data["confidence_pct"], 80.0)

    def test_ai_fill_prediction(self):
        response = self.client.get("/bins")
        first_bin_id = response.json()[0]["id"]
        pred_resp = self.client.get(f"/predictions/bin/{first_bin_id}")
        self.assertEqual(pred_resp.status_code, 200)
        data = pred_resp.json()
        self.assertIn("hours_until_full", data)
        self.assertIn("overflow_probability", data)
        self.assertIn("forecast_curve", data)

    def test_route_optimization(self):
        response = self.client.post("/routes/optimize", json={
            "max_bins": 6,
            "include_high_priority_only": False
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["stops_count"], 0)
        self.assertGreater(data["fuel_saved_liters"], 0.0)

    def test_analytics_dashboard(self):
        response = self.client.get("/analytics/dashboard")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["total_bins"], 30)
        self.assertIn("recycling_percentage", data)
        self.assertIn("fuel_saved_liters", data)

    def test_end_to_end_demo_flow(self):
        response = self.client.post("/demo/trigger-flow")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertEqual(len(data["steps"]), 10)
        self.assertEqual(data["bin"]["fill_pct"], 0.0)

if __name__ == "__main__":
    unittest.main()
