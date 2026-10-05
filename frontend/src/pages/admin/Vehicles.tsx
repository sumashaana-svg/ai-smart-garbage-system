import React from "react";
import { VehicleData } from "../../services/api";
import { Truck, Battery, Gauge, User, ShieldCheck } from "lucide-react";

interface VehiclesProps {
  vehicles: VehicleData[];
}

export const Vehicles: React.FC<VehiclesProps> = ({ vehicles }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            AUTONOMOUS &amp; ELECTRIC SMART FLEET (5 UNITS)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Real-Time Vehicle Telemetry, On-Board Compactor Load, and Battery Charge Matrix
          </p>
        </div>
        <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          Fleet Health: <strong>100% Operational</strong>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const loadPct = Math.round((v.current_load_kg / v.capacity_kg) * 100);
          return (
            <div
              key={v.id}
              className="cyber-glass rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all font-mono"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-lg">
                    🚛
                  </div>
                  <div>
                    <span className="font-orbitron font-bold text-sm text-cyan-300 block">{v.vehicle_no}</span>
                    <span className="text-[10px] text-slate-400">{v.vehicle_type}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    v.status === "AVAILABLE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* Load Capacity Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Load Capacity:</span>
                  <span className="text-slate-200 font-bold">
                    {v.current_load_kg} / {v.capacity_kg} kg ({loadPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      loadPct > 80 ? "bg-red-500" : loadPct > 50 ? "bg-amber-400" : "bg-cyan-400"
                    }`}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Grid Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Driver / Pilot:</span>
                  <span className="text-slate-300 font-medium truncate block">{v.driver_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Battery / Fuel:</span>
                  <span className="text-emerald-400 font-bold">{v.fuel_pct}% Charged</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GPS Coordinates:</span>
                  <span className="text-slate-400 text-[10px]">{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Compaction:</span>
                  <span className="text-cyan-300">Hydraulic Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
