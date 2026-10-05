import React, { useState, useEffect } from "react";
import {
  api, BinData, AnalyticsSummary, PredictionData, RouteData,
  VehicleData, ComplaintData, WS_BASE_URL
} from "./services/api";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/admin/Dashboard";
import { Bins } from "./pages/admin/Bins";
import { Analytics } from "./pages/admin/Analytics";
import { Routes } from "./pages/admin/Routes";
import { Vehicles } from "./pages/admin/Vehicles";
import { Complaints } from "./pages/admin/Complaints";
import { WorkerDashboard } from "./pages/worker/WorkerDashboard";
import { CitizenDashboard } from "./pages/citizen/CitizenDashboard";
import { AIClassifierPage } from "./pages/AIClassifierPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { DemoFlowModal } from "./components/DemoFlowModal";
import { hudSound } from "./utils/sound";

export const App: React.FC = () => {
  // State
  const [role, setRole] = useState<"admin" | "worker" | "citizen">("admin");
  const [tab, setTab] = useState<string>("dashboard");
  const [bins, setBins] = useState<BinData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [selectedBin, setSelectedBin] = useState<BinData | null>(null);

  // IoT WebSocket State
  const [iotConnected, setIotConnected] = useState<boolean>(false);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // Initial Data Fetch
  const refreshAllData = async () => {
    try {
      const [b, a, p, r, v, c] = await Promise.all([
        api.getBins(),
        api.getDashboardAnalytics(),
        api.getPredictions(),
        api.getRoutes(),
        api.getVehicles(),
        api.getComplaints(),
      ]);
      setBins(b);
      setAnalytics(a);
      setPredictions(p);
      setRoutes(r);
      setVehicles(v);
      setComplaints(c);
      if (b.length > 0 && !selectedBin) {
        setSelectedBin(b[0]);
      }
    } catch (err) {
      console.error("Initial load error:", err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Real-time IoT WebSocket Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_BASE_URL);

        ws.onopen = () => {
          setIotConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "BIN_TELEMETRY") {
              // Update bin state in-place
              setBins((prevBins) =>
                prevBins.map((b) => {
                  if (b.id === data.bin_id) {
                    return {
                      ...b,
                      current_fill_pct: data.fill_pct,
                      current_weight_kg: data.weight_kg,
                      temperature_c: data.temperature_c,
                      gas_ppm: data.gas_ppm,
                      battery_pct: data.battery_pct,
                      priority: data.priority,
                      bin_health: data.bin_health,
                      is_overflowing: data.is_overflowing,
                    };
                  }
                  return b;
                })
              );
            }
          } catch (e) {
            // Ignore non-json
          }
        };

        ws.onclose = () => {
          setIotConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIotConnected(false);
        };
      } catch (err) {
        setIotConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // 1-Click End-to-End Demo Flow Trigger
  const handleTriggerDemoFlow = async () => {
    setIsDemoRunning(true);
    try {
      const res = await api.triggerDemoFlow();
      setDemoData(res);
      setDemoModalOpen(true);
      refreshAllData();
    } catch (err) {
      console.error("Demo flow error:", err);
    } finally {
      setIsDemoRunning(false);
    }
  };

  const activeRoute = routes[0] || null;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Floating Anti-Gravity Navigation Bar */}
      <Navbar
        currentRole={role}
        onRoleChange={(r) => {
          setRole(r);
          setSelectedBin(null);
        }}
        activeTab={tab}
        onTabChange={setTab}
        iotConnected={iotConnected}
        onTriggerDemoFlow={handleTriggerDemoFlow}
        isDemoRunning={isDemoRunning}
      />

      {/* Main Command View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-12">
        {/* Admin Views */}
        {role === "admin" && (
          <>
            {tab === "dashboard" && (
              <Dashboard
                bins={bins}
                analytics={analytics}
                predictions={predictions}
                activeRoute={activeRoute}
                onSelectBin={setSelectedBin}
                selectedBin={selectedBin}
                onOptimizeRoute={() => {
                  api.optimizeRoute({ max_bins: 8 }).then(() => {
                    refreshAllData();
                  });
                }}
              />
            )}
            {tab === "bins" && (
              <Bins
                bins={bins}
                onSelectBin={setSelectedBin}
                selectedBin={selectedBin}
              />
            )}
            {tab === "analytics" && <Analytics summary={analytics} />}
            {tab === "routes" && (
              <Routes
                bins={bins}
                vehicles={vehicles}
                activeRoute={activeRoute}
                onRefreshRoute={refreshAllData}
              />
            )}
            {tab === "vehicles" && <Vehicles vehicles={vehicles} />}
            {tab === "complaints" && (
              <Complaints
                complaints={complaints}
                onRefresh={refreshAllData}
              />
            )}
            {tab === "classifier" && <AIClassifierPage />}
            {tab === "predictions" && <PredictionsPage bins={bins} />}
          </>
        )}

        {/* Worker Views */}
        {role === "worker" && (
          <>
            {(tab === "worker-dash" || tab === "worker-history") && (
              <WorkerDashboard
                bins={bins}
                activeRoute={activeRoute}
                onRefresh={refreshAllData}
              />
            )}
            {tab === "worker-bins" && (
              <Bins
                bins={bins}
                onSelectBin={setSelectedBin}
                selectedBin={selectedBin}
              />
            )}
            {tab === "classifier" && <AIClassifierPage />}
          </>
        )}

        {/* Citizen Views */}
        {role === "citizen" && (
          <>
            {(tab === "citizen-dash" || tab === "report" || tab === "nearby" || tab === "rewards") && (
              <CitizenDashboard
                bins={bins}
                complaints={complaints}
                onRefresh={refreshAllData}
              />
            )}
            {tab === "classifier" && <AIClassifierPage />}
          </>
        )}
      </main>

      {/* 10-Step Demo Flow Execution Modal */}
      <DemoFlowModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        demoData={demoData}
      />

      {/* Footer Command Center HUD */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            &copy; 2050 ANTI-GRAVITY AI SMART GARBAGE MANAGEMENT PLATFORM
          </span>
          <span className="text-cyan-400">
            Predict &bull; Optimize &bull; Collect &bull; Recycle
          </span>
          <span>SYSTEM VERSION 2.0.0 // BENGALURU SMART GRID</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
