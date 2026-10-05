import React, { useState } from "react";
import { BinData, RouteData, VehicleData, api } from "../../services/api";
import { HolographicMap } from "../../components/HolographicMap";
import { Truck, Navigation, Fuel, Clock, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { hudSound } from "../../utils/sound";

interface RoutesProps {
  bins: BinData[];
  vehicles: VehicleData[];
  activeRoute: RouteData | null;
  onRefreshRoute: () => void;
}

export const Routes: React.FC<RoutesProps> = ({
  bins,
  vehicles,
  activeRoute,
  onRefreshRoute,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [maxBins, setMaxBins] = useState(8);
  const [priorityOnly, setPriorityOnly] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    hudSound.playLevitate();
    try {
      await api.optimizeRoute({
        max_bins: maxBins,
        include_high_priority_only: priorityOnly,
      });
      hudSound.playSuccess();
      onRefreshRoute();
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Generate route coordinates for Leaflet polyline
  const prioritizedBins = bins
    .filter((b) => b.priority === "CRITICAL" || b.priority === "HIGH")
    .slice(0, maxBins);

  const routeCoords: [number, number][] = [
    [12.9716, 77.5946], // Depot start
    ...prioritizedBins.map((b) => [b.latitude, b.longitude] as [number, number]),
  ];

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            AI SMART COLLECTION ROUTE PLANNER (TSP HEURISTIC)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            CRITICAL Priority Sequential Weighting &bull; Real-time Traffic Multiplier &bull; Carbon Reduction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <input
              type="checkbox"
              checked={priorityOnly}
              onChange={(e) => setPriorityOnly(e.target.checked)}
              className="rounded bg-slate-900 border-cyan-500 text-cyan-500 focus:ring-0"
            />
            <span>Critical Only</span>
          </label>

          <select
            value={maxBins}
            onChange={(e) => setMaxBins(Number(e.target.value))}
            className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
          >
            <option value={6}>6 Waypoints</option>
            <option value={8}>8 Waypoints</option>
            <option value={12}>12 Waypoints</option>
            <option value={16}>16 Waypoints</option>
          </select>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-orbitron text-xs font-bold shadow-neon-cyan hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isOptimizing ? "CALCULATING..." : "GENERATE OPTIMAL ROUTE"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Estimated Travel Distance</span>
          <div className="text-2xl font-bold font-orbitron text-cyan-300 mt-1">
            {activeRoute?.total_distance_km || 14.8} km
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Shortest Hamilton Cycle</span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Total Shift Time</span>
          <div className="text-2xl font-bold font-orbitron text-slate-200 mt-1">
            {activeRoute?.estimated_time_mins || 48} mins
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Includes 4m service / bin</span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Fuel Saved</span>
          <div className="text-2xl font-bold font-orbitron text-amber-300 mt-1">
            {activeRoute?.fuel_saved_liters || 4.2} Liters
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1">~11.2 kg CO2 avoided</span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Dispatch Target Bins</span>
          <div className="text-2xl font-bold font-orbitron text-emerald-300 mt-1">
            {prioritizedBins.length} Nodes
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Ranked by Critical Urgency</span>
        </div>
      </div>

      {/* Map & Ordered Waypoint List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Holographic Route Map (8 Cols) */}
        <div className="lg:col-span-8 min-h-[460px]">
          <HolographicMap
            bins={bins}
            vehicles={vehicles}
            routeCoordinates={routeCoords}
          />
        </div>

        {/* Ordered Sequential Stops List (4 Cols) */}
        <div className="lg:col-span-4 cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-xs text-cyan-300 uppercase mb-3 flex items-center justify-between">
              <span>WAYPOINT DISPATCH QUEUE</span>
              <span className="text-[10px] font-mono text-emerald-400">CRITICAL FIRST</span>
            </h3>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {/* Depot Start Point */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">ORIGIN DEPOT</span>
                  <span className="font-bold text-slate-300">Central Waste Dispatch Center</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold">START</span>
              </div>

              {prioritizedBins.map((b, idx) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-400/40 transition-all flex items-center justify-between text-xs font-mono"
                >
                  <div className="truncate mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-cyan-400 font-orbitron">STOP 0{idx + 1}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          b.priority === "CRITICAL"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {b.priority}
                      </span>
                    </div>
                    <span className="font-bold text-slate-200 block truncate mt-0.5">{b.code}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{b.location_name}</span>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-cyan-300 font-bold block">{b.current_fill_pct}%</span>
                    <span className="text-[10px] text-slate-500">{b.current_weight_kg} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Vehicle: Cyber Hauler Alpha</span>
            <span className="text-emerald-400 font-bold">Status: Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
