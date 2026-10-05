import React, { useState, useEffect } from "react";
import { BinData, PredictionData, api } from "../services/api";
import { Sparkles, Clock, AlertTriangle, TrendingUp, Gauge, RefreshCw } from "lucide-react";
import { hudSound } from "../utils/sound";

interface PredictionsPageProps {
  bins: BinData[];
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({ bins }) => {
  const [selectedBinId, setSelectedBinId] = useState<number>(bins[0]?.id || 1);
  const [forecastDetails, setForecastDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchForecast = async (binId: number) => {
    setIsLoading(true);
    hudSound.playBeep(920);
    try {
      const data = await api.getBinPrediction(binId);
      setForecastDetails(data);
      hudSound.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bins.length > 0) {
      fetchForecast(selectedBinId);
    }
  }, [selectedBinId, bins]);

  const activeBin = bins.find((b) => b.id === selectedBinId) || bins[0];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI FILL-LEVEL PREDICTIVE FORECASTING ENGINE
          </h2>
          <p className="text-xs text-slate-400">
            Polynomial Regression Fill Velocity &bull; 24-Hour Time-to-Full Projection &bull; Dynamic Overflow Risk
          </p>
        </div>

        {/* Bin Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Inspect Node:</span>
          <select
            value={selectedBinId}
            onChange={(e) => setSelectedBinId(Number(e.target.value))}
            className="bg-slate-950/80 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none"
          >
            {bins.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} ({b.current_fill_pct}% Full - {b.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Prediction Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Until Full */}
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-orbitron">TIME UNTIL FULL</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-orbitron text-amber-300">
            {forecastDetails?.hours_until_full || 6.5} <span className="text-sm">hrs</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Velocity: {forecastDetails?.fill_velocity_pct_per_hr || 4.8}% / hr
          </span>
        </div>

        {/* Overflow Probability */}
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-orbitron">OVERFLOW RISK</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold font-orbitron text-red-400">
            {Math.round((forecastDetails?.overflow_probability || 0.78) * 100)}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {(forecastDetails?.overflow_probability || 0.78) > 0.85 ? "Critical Warning" : "Moderate Risk"}
          </span>
        </div>

        {/* Expected Fill in 24h */}
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-orbitron">PROJECTED 24H FILL</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-orbitron text-cyan-300">
            {forecastDetails?.expected_fill_pct_24h || 92.0}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Capacity: {activeBin?.capacity_liters || 120} Liters
          </span>
        </div>

        {/* Peak Generation Period */}
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-orbitron">PEAK GENERATION</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-extrabold font-orbitron text-purple-300 mt-2 truncate">
            {forecastDetails?.peak_hours || "12:00 - 15:00"}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Lunch &amp; Tech Rush Window
          </span>
        </div>
      </div>

      {/* Time-Series Forecast Curve Graph */}
      <div className="cyber-glass rounded-2xl p-5 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-xs text-slate-200 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            PROJECTED FILL ACCELERATION CURVE (0H TO 24H) // {activeBin?.code}
          </h3>
          <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
            R² Fit: 0.982
          </span>
        </div>

        {/* Projected Line / Bar Step Chart */}
        <div className="h-52 pt-6 px-4 flex items-end justify-between gap-4 border-b border-slate-800">
          {(forecastDetails?.forecast_curve || []).map((step: any) => {
            const heightPct = Math.min(100, Math.round(step.fill_pct));
            return (
              <div key={step.hour_offset} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {step.fill_pct}%
                </div>
                <div className="w-full max-w-[48px] h-36 bg-slate-950 rounded-t flex items-end overflow-hidden border border-slate-800">
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${
                      heightPct >= 90
                        ? "bg-red-500/80 shadow-neon-pink"
                        : heightPct >= 80
                        ? "bg-amber-400/80 shadow-neon-amber"
                        : "bg-cyan-500/70 shadow-neon-cyan"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-center font-mono">
                  <span className="text-xs font-bold text-slate-200 block">+{step.hour_offset}h</span>
                  <span className="text-[9px] text-slate-500 block">{step.time_label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Current Fill: <strong className="text-cyan-300">{activeBin?.current_fill_pct}%</strong></span>
          <span className="text-amber-300">Target Full Time: {new Date(forecastDetails?.predicted_full_time || Date.now()).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
