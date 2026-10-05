import React, { useState } from "react";
import {
  BinData, AnalyticsSummary, PredictionData, RouteData
} from "../../services/api";
import { AntiGravity3D } from "../../components/AntiGravity3D";
import { HolographicMap } from "../../components/HolographicMap";
import { SensorGauges } from "../../components/SensorGauges";
import {
  AlertTriangle, CheckCircle, TrendingUp, Zap, Truck,
  Recycle, Gauge, Clock, Fuel, Sparkles, MapPin
} from "lucide-react";
import { hudSound } from "../../utils/sound";

interface DashboardProps {
  bins: BinData[];
  analytics: AnalyticsSummary | null;
  predictions: PredictionData[];
  activeRoute: RouteData | null;
  onSelectBin: (bin: BinData) => void;
  selectedBin: BinData | null;
  onOptimizeRoute: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  bins,
  analytics,
  predictions,
  activeRoute,
  onSelectBin,
  selectedBin,
  onOptimizeRoute,
}) => {
  const [viewMode, setViewMode] = useState<"3D" | "MAP">("3D");

  const criticalBins = bins.filter(
    (b) => b.priority === "CRITICAL" || b.current_fill_pct >= 90
  );

  return (
    <div className="space-y-4">
      {/* TOP: System Status & Diagnostic Bar */}
      <div className="cyber-glass rounded-2xl p-3 px-5 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">CORE STATUS:</span>
            <span className="font-bold text-emerald-400 font-orbitron">OPERATIONAL (2050)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">AI PREDICTION ENGINE:</span>
            <span className="font-bold text-cyan-300 font-orbitron">ACTIVE (94.8% ACCURACY)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">FLEET DISPATCH:</span>
            <span className="font-bold text-amber-300 font-orbitron">5 PODS CONNECTED</span>
          </div>
        </div>

        {/* 3D vs Hologram Map Toggle */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-cyan-500/40">
          <button
            onClick={() => {
              hudSound.playBeep(850);
              setViewMode("3D");
            }}
            className={`px-3 py-1 rounded-lg font-orbitron transition-all ${
              viewMode === "3D"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-neon-cyan font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            3D LEVITATION MATRIX
          </button>
          <button
            onClick={() => {
              hudSound.playBeep(850);
              setViewMode("MAP");
            }}
            className={`px-3 py-1 rounded-lg font-orbitron transition-all ${
              viewMode === "MAP"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-neon-cyan font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            HOLOGRAPHIC MAP
          </button>
        </div>
      </div>

      {/* MAIN 3-PANEL COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Real-Time Statistics HUD (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Total Bins & Critical Counts */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-orbitron text-slate-400 uppercase tracking-wider">
                SMART DUSTBINS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                IoT Grid
              </span>
            </div>
            <div className="text-3xl font-extrabold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">
              {analytics?.total_bins || bins.length}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Active Online</span>
                <span className="text-emerald-400 font-bold">{analytics?.active_bins || 29}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-red-500/30">
                <span className="text-red-400 text-[10px] block">Critical / Overflow</span>
                <span className="text-red-400 font-bold">{criticalBins.length}</span>
              </div>
            </div>
          </div>

          {/* Recycling & Carbon Offset */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-orbitron text-slate-400 uppercase tracking-wider">
                CIRCULAR RECYCLING
              </span>
              <Recycle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-orbitron text-emerald-400">
              {analytics?.recycling_percentage || 76.4}%
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-neon-green"
                style={{ width: `${analytics?.recycling_percentage || 76.4}%` }}
              />
            </div>
            <div className="mt-3 text-xs font-mono text-slate-300 flex justify-between">
              <span>CO2 Offset:</span>
              <strong className="text-cyan-300">{analytics?.co2_offset_kg || 22500} kg</strong>
            </div>
          </div>

          {/* Fuel & AI Efficiency Savings */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-orbitron text-slate-400 uppercase tracking-wider">
                AI FUEL SAVINGS
              </span>
              <Fuel className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold font-orbitron text-amber-300">
              {analytics?.fuel_saved_liters || 142.5} <span className="text-sm">Liters</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              ~{Math.round((analytics?.fuel_saved_liters || 142) * 2.68)} kg carbon avoided by shortest-path clustering.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Efficiency Index:</span>
              <span className="text-emerald-400 font-bold">{analytics?.collection_efficiency_pct || 98.2}%</span>
            </div>
          </div>

          {/* Critical Bins Alert List */}
          <div className="cyber-glass rounded-2xl p-3 border border-red-500/30">
            <div className="flex items-center gap-1.5 text-xs font-orbitron text-red-400 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>URGENT COLLECTION QUEUE ({criticalBins.length})</span>
            </div>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {criticalBins.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBin(b)}
                  className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 cursor-pointer transition-all flex items-center justify-between text-xs font-mono"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-red-300 block truncate">{b.code}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{b.location_name}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-red-400 font-bold">{b.current_fill_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: 3D Visualization / Holographic Map (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="h-[430px] relative">
            {viewMode === "3D" ? (
              <AntiGravity3D
                bins={bins}
                selectedBinId={selectedBin?.id}
                onSelectBin={(b) => {
                  hudSound.playBeep(980);
                  onSelectBin(b);
                }}
              />
            ) : (
              <HolographicMap
                bins={bins}
                selectedBin={selectedBin}
                onSelectBin={(b) => {
                  hudSound.playBeep(980);
                  onSelectBin(b);
                }}
              />
            )}
          </div>

          {/* If a bin is actively selected, display Sensor Gauges HUD right beneath */}
          {selectedBin && (
            <SensorGauges bin={selectedBin} onClose={() => onSelectBin(null as any)} />
          )}
        </div>

        {/* RIGHT COLUMN: AI Prediction & Forecaster Panel (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-orbitron text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI PREDICTIONS
              </span>
              <span className="text-[10px] font-mono text-slate-400">Next 24h</span>
            </div>

            <div className="space-y-3">
              {predictions.slice(0, 3).map((p) => {
                const associatedBin = bins.find((b) => b.id === p.bin_id);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all font-mono text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-cyan-300">
                        {associatedBin?.code || `Bin #${p.bin_id}`}
                      </span>
                      <span className="text-red-400 font-bold text-[11px]">
                        Risk: {Math.round(p.overflow_probability * 100)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mb-1">
                      {associatedBin?.location_name || "Bengaluru Tech Corridor"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Full in: <strong className="text-amber-300">{p.hours_until_full} hrs</strong></span>
                      <span>Peak: {p.peak_hours.split("&")[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-cyan-400">Time-Series Regression</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Confidence:</span>
                <span className="text-emerald-400">96.4%</span>
              </div>
            </div>
          </div>

          {/* Quick Action: Trigger AI Route Optimization */}
          <div className="cyber-glass-glow rounded-2xl p-4 border border-cyan-400/50 text-center">
            <Truck className="w-6 h-6 text-cyan-400 mx-auto mb-2 animate-bounce" />
            <div className="font-orbitron text-xs font-bold text-cyan-300 uppercase">
              AI ROUTE OPTIMIZER
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Dijkstra &amp; capacity heuristic will re-sequence collections by priority.
            </p>
            <button
              onClick={() => {
                hudSound.playLevitate();
                onOptimizeRoute();
              }}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-orbitron text-xs font-bold shadow-neon-cyan hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              RECALCULATE ROUTE
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM: Live Collection Route & Turn-by-Turn Waypoint Strip */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-orbitron font-bold text-cyan-300 tracking-wider uppercase">
              ACTIVE COLLECTION ROUTE // {activeRoute?.name || "Dynamic Priority Sweep 01"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {activeRoute?.status || "IN_PROGRESS"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Distance: <strong className="text-cyan-300">{activeRoute?.total_distance_km || 14.8} km</strong></span>
            <span>Est. Time: <strong className="text-slate-200">{activeRoute?.estimated_time_mins || 48} mins</strong></span>
            <span>Fuel Saved: <strong className="text-amber-400">{activeRoute?.fuel_saved_liters || 4.2} L</strong></span>
          </div>
        </div>

        {/* Route Waypoints Carousel / Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {bins.filter((b) => b.priority === "CRITICAL" || b.priority === "HIGH").slice(0, 8).map((b, idx) => (
            <div
              key={b.id}
              onClick={() => onSelectBin(b)}
              className="flex-shrink-0 w-44 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400/50 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] text-cyan-400 font-bold">STOP 0{idx + 1}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    b.priority === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {b.priority}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{b.code}</div>
              <div className="text-[10px] text-slate-400 truncate">{b.location_name}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">Fill:</span>
                <span className="font-bold text-cyan-300">{b.current_fill_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
