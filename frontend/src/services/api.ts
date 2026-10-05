export const API_BASE_URL = "http://localhost:8000";
export const WS_BASE_URL = "ws://localhost:8000/ws/telemetry";

export interface BinData {
  id: number;
  code: string;
  location_name: string;
  area: string;
  latitude: number;
  longitude: number;
  capacity_liters: number;
  current_fill_pct: number;
  current_weight_kg: number;
  temperature_c: number;
  gas_ppm: number;
  battery_pct: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  bin_health: "OPTIMAL" | "WARNING" | "CRITICAL";
  is_overflowing: boolean;
  is_fire_hazard: boolean;
  is_gas_leak: boolean;
  last_collection_time?: string;
  updated_at?: string;
}

export interface AnalyticsSummary {
  total_bins: number;
  active_bins: number;
  overflowing_bins: number;
  critical_bins: number;
  total_garbage_collected_kg: number;
  recycling_percentage: number;
  active_vehicles: number;
  pending_complaints: number;
  collection_efficiency_pct: number;
  fuel_saved_liters: number;
  co2_offset_kg: number;
  ai_prediction_accuracy_pct: number;
  iot_uptime_pct: number;
}

export interface PredictionData {
  id: number;
  bin_id: number;
  predicted_full_time: string;
  hours_until_full: number;
  expected_fill_pct_24h: number;
  overflow_probability: number;
  peak_hours: string;
  generated_at: string;
}

export interface WasteClassificationResult {
  detected_category: string;
  confidence_pct: number;
  is_recyclable: boolean;
  disposal_method: string;
  hazard_level: string;
  material_breakdown: Record<string, number>;
  timestamp: string;
}

export interface RouteData {
  id: number;
  name: string;
  total_distance_km: number;
  estimated_time_mins: number;
  fuel_saved_liters: number;
  status: string;
  created_at: string;
  stops?: any[];
}

export interface ComplaintData {
  id: number;
  citizen_id: number;
  bin_id?: number;
  title: string;
  description: string;
  image_url?: string;
  ai_category: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "DANGER" | "CRITICAL";
  category: string;
  is_read: boolean;
  timestamp: string;
}

export interface VehicleData {
  id: number;
  vehicle_no: string;
  vehicle_type: string;
  driver_name: string;
  capacity_kg: number;
  current_load_kg: number;
  fuel_pct: number;
  status: string;
  latitude: number;
  longitude: number;
}

// REST Helper
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("antigravity_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// API Service Functions
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: () => apiRequest<any>("/auth/me"),

  // Bins
  getBins: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest<BinData[]>(`/bins${q ? `?${q}` : ""}`);
  },
  getCriticalBins: () => apiRequest<BinData[]>("/bins/critical"),
  getNearbyBins: (lat: number, lng: number, radius_km = 10) =>
    apiRequest<BinData[]>(`/bins/nearby?lat=${lat}&lng=${lng}&radius_km=${radius_km}`),
  getBin: (id: number) => apiRequest<BinData>(`/bins/${id}`),

  // AI Classification
  classifyWaste: (data: { image_base64?: string; image_url?: string; image_name?: string }) =>
    apiRequest<WasteClassificationResult>("/waste/classify", { method: "POST", body: JSON.stringify(data) }),

  // Predictions
  getPredictions: () => apiRequest<PredictionData[]>("/predictions"),
  getBinPrediction: (binId: number) => apiRequest<any>(`/predictions/bin/${binId}`),
  generatePrediction: (binId: number) =>
    apiRequest<any>("/predictions/generate", { method: "POST", body: JSON.stringify({ bin_id: binId }) }),

  // Routes
  getRoutes: () => apiRequest<RouteData[]>("/routes"),
  getRouteDetails: (id: number) => apiRequest<any>(`/routes/${id}`),
  optimizeRoute: (params: any = {}) =>
    apiRequest<any>("/routes/optimize", { method: "POST", body: JSON.stringify(params) }),
  markStopCollected: (stopId: number, data: any) =>
    apiRequest<any>(`/routes/stops/${stopId}/collect`, { method: "POST", body: JSON.stringify(data) }),

  // Complaints
  getComplaints: () => apiRequest<ComplaintData[]>("/complaints"),
  createComplaint: (data: any) =>
    apiRequest<ComplaintData>("/complaints", { method: "POST", body: JSON.stringify(data) }),
  updateComplaintStatus: (id: number, status: string) =>
    apiRequest<any>(`/complaints/${id}?status=${status}`, { method: "PUT" }),

  // Analytics
  getDashboardAnalytics: () => apiRequest<AnalyticsSummary>("/analytics/dashboard"),
  getWasteTrends: () => apiRequest<any>("/analytics/waste"),
  getCollectionMetrics: () => apiRequest<any>("/analytics/collection"),

  // Notifications
  getNotifications: () => apiRequest<NotificationData[]>("/notifications"),
  markNotificationRead: (id: number) => apiRequest<any>(`/notifications/${id}/read`, { method: "PUT" }),

  // Vehicles
  getVehicles: () => apiRequest<VehicleData[]>("/vehicles"),

  // 1-Click End-to-End Demo Flow
  triggerDemoFlow: () => apiRequest<any>("/demo/trigger-flow", { method: "POST" })
};
