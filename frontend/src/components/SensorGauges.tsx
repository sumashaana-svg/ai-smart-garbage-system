import React from "react";
import { BinData } from "../services/api";
import { AlertTriangle, Flame, Wind, Battery, Gauge, Thermometer, ShieldCheck } from "lucide-react";

interface SensorGaugesProps {
  bin: BinData;
  onClose?: () => void;
}

export const SensorGauges: React.FC<SensorGaugesProps> = ({ bin, onClose }) => {
  const getFillColor = (fill: number) => {
    if (fill >= 90) return "text-red-400 stroke-red-500";
    if (fill >= 80) return "text-amber-400 stroke-amber-500";
    if (fill >= 50) return "text-cyan-400 stroke-cyan-500";
    return "text-emerald-400 stroke-emerald-500";
  };

  return (
    <div className="cyber-glass border border-cyan-500/40 p-5 rounded-2xl shadow-glass relative text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider">
              {bin.code}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                bin.priority === "CRITICAL"
                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                  : bin.priority === "HIGH"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
              }`}
            >
              {bin.priority}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{bin.location_name} &bull; {bin.area}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Fill Percentage (Ultrasonic) */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Gauge className="w-5 h-5 text-cyan-400 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-mono">Ultrasonic Level</span>
          <span className={`text-xl font-bold font-orbitron ${getFillColor(bin.current_fill_pct)}`}>
            {bin.current_fill_pct}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Cap: {bin.capacity_liters}L</span>
        </div>

        {/* Load Cell Weight */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold text-emerald-400 mb-1">⚖️</span>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Load Cell Weight</span>
          <span className="text-xl font-bold font-orbitron text-emerald-300">
            {bin.current_weight_kg} <span className="text-xs">kg</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Precision: ±0.1kg</span>
        </div>

        {/* Temperature (DHT22) */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Thermometer className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-mono">DHT22 Temp</span>
          <span className="text-xl font-bold font-orbitron text-amber-300">
            {bin.temperature_c}°C
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Normal: 20-38°C</span>
        </div>

        {/* MQ-2 Gas / Smoke Sensor */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Wind className="w-5 h-5 text-purple-400 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-mono">MQ-2 Gas / Smoke</span>
          <span className={`text-xl font-bold font-orbitron ${bin.gas_ppm > 200 ? "text-red-400" : "text-purple-300"}`}>
            {bin.gas_ppm} <span className="text-xs">ppm</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Threshold: 350 ppm</span>
        </div>
      </div>

      {/* Secondary Row: Battery, Health, Hazards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
        {/* Battery */}
        <div className="flex items-center gap-3">
          <Battery className={`w-5 h-5 ${bin.battery_pct < 20 ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">IoT Battery</div>
            <div className="text-sm font-bold font-orbitron text-slate-200">{bin.battery_pct}% Charged</div>
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Bin Diagnostic</div>
            <div className="text-sm font-bold font-orbitron text-cyan-300">{bin.bin_health}</div>
          </div>
        </div>

        {/* Hazard Flags */}
        <div className="flex items-center gap-2">
          {bin.is_overflowing && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40">
              <AlertTriangle className="w-3 h-3" /> Overflowing
            </span>
          )}
          {bin.is_fire_hazard && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Flame className="w-3 h-3" /> Fire Alert
            </span>
          )}
          {!bin.is_overflowing && !bin.is_fire_hazard && (
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> No Hazards
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
