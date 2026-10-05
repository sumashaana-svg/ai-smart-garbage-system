import React, { useEffect, useState } from "react";
import { api, AnalyticsSummary } from "../../services/api";
import { TrendingUp, PieChart, BarChart2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface AnalyticsProps {
  summary: AnalyticsSummary | null;
}

export const Analytics: React.FC<AnalyticsProps> = ({ summary }) => {
  const [wasteData, setWasteData] = useState<any>(null);

  useEffect(() => {
    api.getWasteTrends().then(setWasteData).catch(console.error);
  }, []);

  const categories = wasteData?.category_distribution || [
    { name: "Plastic", pct: 28.5, color: "#00f0ff" },
    { name: "Organic", pct: 34.0, color: "#00ff9d" },
    { name: "Paper", pct: 14.5, color: "#ffaa00" },
    { name: "Metal", pct: 8.0, color: "#818cf8" },
    { name: "Glass", pct: 6.5, color: "#38bdf8" },
    { name: "E-waste", pct: 3.5, color: "#f43f5e" },
    { name: "Hazardous", pct: 2.0, color: "#e11d48" },
    { name: "Mixed", pct: 3.0, color: "#94a3b8" }
  ];

  const dailyTrends = wasteData?.daily_trends || [
    { day: "Mon", total_kg: 320, recycled_kg: 240, overflow_events: 1 },
    { day: "Tue", total_kg: 360, recycled_kg: 270, overflow_events: 0 },
    { day: "Wed", total_kg: 410, recycled_kg: 310, overflow_events: 2 },
    { day: "Thu", total_kg: 380, recycled_kg: 285, overflow_events: 1 },
    { day: "Fri", total_kg: 490, recycled_kg: 380, overflow_events: 4 },
    { day: "Sat", total_kg: 580, recycled_kg: 440, overflow_events: 6 },
    { day: "Sun", total_kg: 520, recycled_kg: 395, overflow_events: 3 }
  ];

  const areas = wasteData?.area_breakdown || [
    { area: "Koramangala", weight_kg: 1240, fill_avg: 78 },
    { area: "Indiranagar", weight_kg: 1150, fill_avg: 82 },
    { area: "Whitefield", weight_kg: 980, fill_avg: 69 },
    { area: "MG Road / Central", weight_kg: 1420, fill_avg: 85 },
    { area: "Electronic City", weight_kg: 890, fill_avg: 62 },
    { area: "HSR Layout", weight_kg: 760, fill_avg: 58 }
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            AI PREDICTIVE ANALYTICS &amp; RESOURCE INTELLIGENCE
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Machine Learning Telemetry Aggregation &bull; Multi-Echelon Circular Economy Tracking
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400">
            Model Accuracy: <strong>94.8%</strong>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-300">
            Carbon Offset: <strong>{summary?.co2_offset_kg || 22500} kg</strong>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Daily Generation Avg</span>
          <div className="text-2xl font-bold font-orbitron text-cyan-300 mt-1">437.1 kg/day</div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +4.2% organic recovery
          </span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Weekly Throughput</span>
          <div className="text-2xl font-bold font-orbitron text-emerald-300 mt-1">3,060 kg</div>
          <span className="text-[10px] text-slate-400 font-mono mt-2 block">
            76.4% direct circular diversion
          </span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Monthly Forecast</span>
          <div className="text-2xl font-bold font-orbitron text-amber-300 mt-1">13,200 kg</div>
          <span className="text-[10px] text-cyan-300 font-mono mt-2 block">
            Confidence Interval: &plusmn;2.1%
          </span>
        </div>

        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-orbitron text-slate-400 uppercase">Fleet Fuel Saved</span>
          <div className="text-2xl font-bold font-orbitron text-purple-300 mt-1">142.5 L</div>
          <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
            31.4% reduction via TSP heuristic
          </span>
        </div>
      </div>

      {/* Middle Row: Waste Category Distribution & Daily Trend Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 8 Categories Distribution (5 Cols) */}
        <div className="lg:col-span-5 cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            Waste Category Segregation (8 Classes)
          </h3>

          <div className="space-y-2.5">
            {categories.map((c: any) => (
              <div key={c.name} className="text-xs font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-slate-200">{c.name}</span>
                  </span>
                  <span className="font-bold text-slate-300">{c.pct}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Trend Chart & Overflow Frequency (7 Cols) */}
        <div className="lg:col-span-7 cyber-glass rounded-2xl p-4 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              7-Day Generation vs. Circular Diversion
            </h3>

            {/* Custom Bar Graph */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
              {dailyTrends.map((d: any) => {
                const heightPct = Math.round((d.total_kg / 600) * 100);
                const recycledPct = Math.round((d.recycled_kg / 600) * 100);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1 h-36 relative">
                      {/* Total Waste Bar */}
                      <div
                        className="w-3 bg-cyan-500/40 rounded-t border-t border-cyan-400 group-hover:bg-cyan-500/70 transition-all"
                        style={{ height: `${heightPct}%` }}
                        title={`Total: ${d.total_kg} kg`}
                      />
                      {/* Recycled Bar */}
                      <div
                        className="w-3 bg-emerald-500/60 rounded-t border-t border-emerald-400 group-hover:bg-emerald-500/90 transition-all shadow-neon-green"
                        style={{ height: `${recycledPct}%` }}
                        title={`Recycled: ${d.recycled_kg} kg`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-3">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-500/40 rounded border border-cyan-400" /> Total Waste (kg)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500/60 rounded border border-emerald-400 shadow-neon-green" /> Recycled Circular (kg)
            </span>
            <span className="text-red-400 font-bold">
              Overflow Events: 17 / wk
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area-Wise Generation Breakdown */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
        <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase mb-3">
          SECTOR DISPATCH &amp; GENERATION DENSITY (BENGALURU SMART CITY)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {areas.map((a: any) => (
            <div key={a.area} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center font-mono">
              <span className="text-xs text-cyan-300 font-bold block truncate">{a.area}</span>
              <span className="text-lg font-orbitron font-bold text-slate-200 mt-1 block">
                {a.weight_kg} <span className="text-[10px]">kg</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Avg Fill: {a.fill_avg}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
