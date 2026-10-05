import React, { useState } from "react";
import { BinData } from "../../services/api";
import { SensorGauges } from "../../components/SensorGauges";
import { Search, Filter, AlertTriangle, ShieldCheck, Flame, Wind, Eye } from "lucide-react";
import { hudSound } from "../../utils/sound";

interface BinsProps {
  bins: BinData[];
  onSelectBin: (bin: BinData) => void;
  selectedBin: BinData | null;
}

export const Bins: React.FC<BinsProps> = ({ bins, onSelectBin, selectedBin }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");

  const filteredBins = bins.filter((b) => {
    const matchesSearch =
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || b.priority === priorityFilter;
    const matchesArea = areaFilter === "ALL" || b.area === areaFilter;
    return matchesSearch && matchesPriority && matchesArea;
  });

  const areas = Array.from(new Set(bins.map((b) => b.area)));

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider">
            SMART DUSTBIN NETWORK MATRIX ({bins.length} UNITS)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Bengaluru Smart City IoT Telemetry Stream &bull; Ultrasonic, Load Cell, MQ-2 Gas &amp; DHT22
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono w-48 sm:w-60"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical (&gt;90%)</option>
            <option value="HIGH">High (80-90%)</option>
            <option value="MEDIUM">Medium (50-80%)</option>
            <option value="LOW">Low (&lt;50%)</option>
          </select>

          {/* Area Filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="ALL">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Bin Sensor Modal / Inspection Card */}
      {selectedBin && (
        <SensorGauges bin={selectedBin} onClose={() => onSelectBin(null as any)} />
      )}

      {/* Bins Table / Grid */}
      <div className="cyber-glass rounded-2xl border border-cyan-500/20 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800 text-[11px] font-orbitron">
              <tr>
                <th className="py-3 px-4">Bin Code</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Fill Level</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">MQ-2 Gas</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBins.map((b) => {
                const isCrit = b.priority === "CRITICAL" || b.current_fill_pct >= 90;
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-cyan-950/20 transition-colors cursor-pointer ${
                      selectedBin?.id === b.id ? "bg-cyan-950/40 border-l-2 border-cyan-400" : ""
                    }`}
                    onClick={() => {
                      hudSound.playBeep(920, 0.05);
                      onSelectBin(b);
                    }}
                  >
                    <td className="py-3 px-4 font-bold text-cyan-300 font-orbitron flex items-center gap-1.5">
                      {isCrit && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                      {b.code}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium">{b.location_name}</div>
                      <div className="text-[10px] text-slate-500">{b.area}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.current_fill_pct >= 90
                                ? "bg-red-500"
                                : b.current_fill_pct >= 80
                                ? "bg-amber-400"
                                : b.current_fill_pct >= 50
                                ? "bg-cyan-400"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${b.current_fill_pct}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            b.current_fill_pct >= 90
                              ? "text-red-400"
                              : b.current_fill_pct >= 80
                              ? "text-amber-400"
                              : "text-slate-200"
                          }`}
                        >
                          {b.current_fill_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{b.current_weight_kg} kg</td>
                    <td className="py-3 px-4 text-slate-300">{b.temperature_c}°C</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className={b.gas_ppm > 200 ? "text-red-400 font-bold" : ""}>
                        {b.gas_ppm} ppm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{b.battery_pct}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.priority === "CRITICAL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : b.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : b.priority === "MEDIUM"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {b.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hudSound.playBeep(920);
                          onSelectBin(b);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/40 transition-all text-[10px] font-orbitron"
                      >
                        TELEMETRY
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
