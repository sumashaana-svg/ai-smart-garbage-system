import React, { useState } from "react";
import { BinData, RouteData, api } from "../../services/api";
import {
  Truck, CheckCircle, AlertTriangle, Camera, Navigation,
  ShieldAlert, Sparkles, MapPin, Gauge, Flame
} from "lucide-react";
import { hudSound } from "../../utils/sound";

interface WorkerDashboardProps {
  bins: BinData[];
  activeRoute: RouteData | null;
  onRefresh: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  bins,
  activeRoute,
  onRefresh,
}) => {
  const [selectedBinToCollect, setSelectedBinToCollect] = useState<BinData | null>(null);
  const [collectionWeight, setCollectionWeight] = useState("24.5");
  const [notes, setNotes] = useState("Optical barcode & weight verified.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Hazard reporting modal state
  const [hazardBin, setHazardBin] = useState<BinData | null>(null);
  const [hazardType, setHazardType] = useState("CHEMICAL_HAZARD");

  // Worker targets the critical and high bins in assigned route
  const targetBins = bins.filter((b) => b.priority === "CRITICAL" || b.priority === "HIGH");

  const handleConfirmCollection = async () => {
    if (!selectedBinToCollect) return;
    setIsSubmitting(true);
    hudSound.playLevitate();
    try {
      await api.markStopCollected(1, {
        bin_id: selectedBinToCollect.id,
        collected_weight_kg: parseFloat(collectionWeight) || 20.0,
        proof_image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
        notes: notes,
      });
      hudSound.playSuccess();
      setSuccessMessage(`Bin ${selectedBinToCollect.code} emptied and reset to 0% fill level!`);
      setSelectedBinToCollect(null);
      setTimeout(() => setSuccessMessage(""), 4000);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Worker Header & Profile */}
      <div className="cyber-glass rounded-2xl p-4 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-400 flex items-center justify-center text-xl shadow-neon-amber">
            👷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-orbitron font-bold text-base text-amber-300">
                OFFICER RAJESH KUMAR // ID: AGW-2050-1001
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ON DUTY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle: Cyber Hauler Alpha &bull; Zone: Central Tech Corridor &bull; Shift: Day-A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block">Collected Today</span>
            <strong className="text-amber-300 text-sm">384.5 kg</strong>
          </div>
          <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block">Stops Completed</span>
            <strong className="text-emerald-400 text-sm">9 / 12</strong>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="cyber-glass-glow rounded-2xl p-3 border border-emerald-400 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Active Navigation HUD for Next Bin */}
      {targetBins[0] && (
        <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span className="text-xs font-orbitron font-bold text-cyan-300 tracking-wider">
                CURRENT TARGET NODE // NAVIGATION HUD
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold animate-pulse">
                {targetBins[0].priority} PRIORITY
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Estimated Distance: <strong className="text-cyan-300">1.2 km</strong> (ETA: 4 mins)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Bin Identifier:</span>
              <strong className="text-base text-cyan-300 font-orbitron block">{targetBins[0].code}</strong>
              <span className="text-slate-300 block truncate mt-1">{targetBins[0].location_name}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Sensor Telemetry:</span>
                <span className="text-red-400 font-bold text-lg block">{targetBins[0].current_fill_pct}% Full</span>
                <span className="text-slate-400 text-[10px]">Weight: {targetBins[0].current_weight_kg} kg</span>
              </div>
              <Gauge className="w-8 h-8 text-red-400/60" />
            </div>

            <div className="flex flex-col justify-center gap-2">
              <button
                onClick={() => {
                  hudSound.playBeep(980);
                  setSelectedBinToCollect(targetBins[0]);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-orbitron text-xs font-bold shadow-neon-green hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>EMPTY &amp; UPLOAD PROOF</span>
              </button>
              <button
                onClick={() => {
                  hudSound.playAlert();
                  setHazardBin(targetBins[0]);
                }}
                className="w-full py-1.5 rounded-xl bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/60 text-[11px] font-mono"
              >
                Report Hazard / Damage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prioritized Bins Collection Queue */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30">
        <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase mb-3 flex items-center justify-between">
          <span>PRIORITIZED ROUTE STOP SEQUENCE ({targetBins.length} BINS REMAINING)</span>
          <span className="text-[10px] font-mono text-cyan-400">AI Sequenced</span>
        </h3>

        <div className="space-y-2">
          {targetBins.map((b, idx) => (
            <div
              key={b.id}
              className="cyber-glass rounded-xl p-3 border border-slate-800 hover:border-cyan-400/40 transition-all flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-orbitron text-cyan-300 font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 font-orbitron">{b.code}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        b.priority === "CRITICAL"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {b.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{b.location_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-cyan-300 font-bold block">{b.current_fill_pct}% Fill</span>
                  <span className="text-[10px] text-slate-500">{b.current_weight_kg} kg</span>
                </div>

                <button
                  onClick={() => {
                    hudSound.playBeep(920);
                    setSelectedBinToCollect(b);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40 transition-all font-orbitron text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>COLLECT</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optical Photo Proof & Confirmation Modal */}
      {selectedBinToCollect && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass-glow max-w-md w-full p-6 rounded-2xl border border-cyan-400 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="font-orbitron font-bold text-sm text-cyan-300">
                COLLECTION PROOF // {selectedBinToCollect.code}
              </span>
              <button
                onClick={() => setSelectedBinToCollect(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Simulated Camera Verification:</span>
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 h-36 bg-slate-950 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"
                  alt="Proof"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 border border-cyan-400 m-3 rounded pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded">
                    AI OPTICAL VERIFY: 100% EMPTY
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Collected Weight (kg):</label>
                <input
                  type="number"
                  value={collectionWeight}
                  onChange={(e) => setCollectionWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Biometric Verification:</label>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-center font-bold">
                  VERIFIED OK
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Field Notes:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedBinToCollect(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-orbitron"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmCollection}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-orbitron font-bold shadow-neon-green"
              >
                {isSubmitting ? "TRANSMITTING..." : "CONFIRM & RESET (0%)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hazard Report Modal */}
      {hazardBin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-glass-glow max-w-md w-full p-6 rounded-2xl border border-red-500 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-red-500/40 pb-3">
              <span className="font-orbitron font-bold text-sm text-red-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                REPORT HAZARD // {hazardBin.code}
              </span>
              <button onClick={() => setHazardBin(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Hazard Category:</label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="FIRE_SMOKE">Fire / Thermal Anomaly</option>
                <option value="CHEMICAL_HAZARD">Chemical Spill / Toxic Gas</option>
                <option value="DAMAGED_SENSOR">Ultrasonic / Load Cell Sensor Failure</option>
                <option value="JAMMED_LID">Lid Anti-Gravity Mechanism Jammed</option>
              </select>
            </div>

            <button
              onClick={() => {
                hudSound.playAlert();
                setSuccessMessage(`Hazard dispatched for ${hazardBin.code}. Emergency pod alerted.`);
                setHazardBin(null);
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-orbitron font-bold shadow-neon-pink"
            >
              TRANSMIT URGENT HAZARD ALERT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
