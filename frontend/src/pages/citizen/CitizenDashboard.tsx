import React, { useState } from "react";
import { BinData, ComplaintData, api } from "../../services/api";
import {
  Sparkles, Camera, MapPin, Gift, AlertTriangle, CheckCircle,
  Clock, Shield, Send, Upload
} from "lucide-react";
import { hudSound } from "../../utils/sound";

interface CitizenDashboardProps {
  bins: BinData[];
  complaints: ComplaintData[];
  onRefresh: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  bins,
  complaints,
  onRefresh,
}) => {
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [selectedBinId, setSelectedBinId] = useState<number>(bins[0]?.id || 1);
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const userPoints = 420;

  const handleSimulatePhotoUpload = async (categoryPreset: string) => {
    hudSound.playBeep(880);
    setUploadedImageName(`${categoryPreset.toLowerCase()}_waste_sample.jpg`);
    try {
      const res = await api.classifyWaste({ image_name: `${categoryPreset.toLowerCase()}_bottle.jpg` });
      setAiPreview(res);
      setReportTitle(`Overflowing ${res.detected_category} at Smart Bin`);
      setReportDesc(`Observed uncollected ${res.detected_category.toLowerCase()} waste pile. AI estimated confidence ${res.confidence_pct}%.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle) return;
    setIsSubmitting(true);
    hudSound.playLevitate();
    try {
      await api.createComplaint({
        bin_id: selectedBinId,
        title: reportTitle,
        description: reportDesc || "Citizen optical report submitted via smart city portal.",
        image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        ai_category: aiPreview?.detected_category || "Mixed",
      });
      hudSound.playSuccess();
      setToastMessage("Report registered! +50 Eco-Points added to your citizen balance.");
      setReportTitle("");
      setReportDesc("");
      setAiPreview(null);
      setTimeout(() => setToastMessage(""), 5000);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nearbyBins = bins.slice(0, 5);

  return (
    <div className="space-y-4 font-mono">
      {/* Citizen Hero & Rewards HUD */}
      <div className="cyber-glass-glow rounded-2xl p-5 border border-emerald-400/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400 flex items-center justify-center text-2xl shadow-neon-green">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-orbitron font-bold text-base text-emerald-300">
                CITIZEN AARAV MEHTA // ECO GUARDIAN
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LEVEL 4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bengaluru Smart City Cleanliness Ambassador &bull; 14 Verified Reports
            </p>
          </div>
        </div>

        {/* Eco Rewards Points Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-emerald-500/30 shadow-neon-green">
          <Gift className="w-5 h-5 text-emerald-400 animate-bounce" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Cleanliness Points</span>
            <strong className="text-xl font-orbitron font-extrabold text-emerald-400">
              {userPoints} PTS
            </strong>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="cyber-glass rounded-2xl p-3 border border-emerald-400 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2-Column: Left = Report Overflow Form, Right = Nearby Smart Bins & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Report Overflow / Illegal Dumping Form (6 Cols) */}
        <div className="lg:col-span-6 cyber-glass rounded-2xl p-5 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              REPORT OVERFLOWING BIN / ILLEGAL DUMPING
            </h3>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Earn +50 Pts
            </span>
          </div>

          {/* Quick Photo Simulation Presets */}
          <div className="mb-4">
            <label className="text-[11px] text-slate-400 block mb-1.5">
              Simulate Camera Capture / Waste Image Upload:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["Plastic", "Paper", "Glass", "Organic"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSimulatePhotoUpload(preset)}
                  className="py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-[11px] text-slate-300 hover:text-cyan-300 transition-all text-center"
                >
                  📸 {preset}
                </button>
              ))}
            </div>
          </div>

          {/* AI Live Analysis Preview Badge */}
          {aiPreview && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/60 flex items-center justify-between text-xs animate-fadeIn">
              <div>
                <span className="text-[10px] text-cyan-400 block font-bold">AI COMPUTER VISION DETECTED:</span>
                <strong className="text-slate-100 text-sm">{aiPreview.detected_category}</strong>
                <span className="text-slate-400 text-[10px] block mt-0.5">
                  Confidence: {aiPreview.confidence_pct}% &bull; Recyclable: {aiPreview.is_recyclable ? "YES" : "NO"}
                </span>
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 px-2 py-1 rounded">
                Verified
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Smart Bin Location:</label>
              <select
                value={selectedBinId}
                onChange={(e) => setSelectedBinId(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.location_name} ({b.current_fill_pct}% Full)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Incident Headline:</label>
              <input
                type="text"
                placeholder="e.g., Severe plastic bottle overflow blocking sidewalk"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Description / Observed Hazard:</label>
              <textarea
                rows={3}
                placeholder="Provide any details about waste smell, road blockage, or fire risk..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-orbitron font-bold text-xs shadow-neon-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "TRANSMITTING TO FLEET..." : "SUBMIT REPORT (+50 POINTS)"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Nearby Bins Radar & Past Complaint Tracker (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Nearby Smart Bins Radar */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <h3 className="font-orbitron font-bold text-xs text-cyan-300 uppercase mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              NEARBY SMART BINS (WALKING DISTANCE)
            </h3>

            <div className="space-y-2">
              {nearbyBins.map((b, idx) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{b.code}</span>
                      <span className="text-[10px] text-slate-400 font-mono">~{idx * 150 + 120}m away</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{b.location_name}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        b.current_fill_pct >= 90
                          ? "text-red-400"
                          : b.current_fill_pct >= 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {b.current_fill_pct}% Full
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {b.current_fill_pct < 80 ? "Available" : "Near Capacity"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Recent Reports Status */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              YOUR REPORT TRACKING HISTORY
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {complaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-200 block truncate">{c.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === "RESOLVED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
