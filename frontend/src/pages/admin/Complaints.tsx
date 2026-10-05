import React, { useState } from "react";
import { ComplaintData, api } from "../../services/api";
import { MessageSquare, AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { hudSound } from "../../utils/sound";

interface ComplaintsProps {
  complaints: ComplaintData[];
  onRefresh: () => void;
}

export const Complaints: React.FC<ComplaintsProps> = ({ complaints, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = complaints.filter(
    (c) => statusFilter === "ALL" || c.status === statusFilter
  );

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    hudSound.playBeep(940);
    try {
      await api.updateComplaintStatus(id, newStatus);
      hudSound.playSuccess();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            CITIZEN REPORTING &amp; DISPATCH QUEUE ({complaints.length})
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Computer Vision Verification &bull; Anomaly Classification &bull; Rapid Response
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "PENDING", "INVESTIGATING", "RESOLVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-orbitron text-xs transition-all ${
                statusFilter === s
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-neon-cyan font-bold"
                  : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="cyber-glass rounded-2xl p-4 border border-cyan-500/20 hover:border-cyan-400/40 transition-all font-mono"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-sm text-slate-200">{c.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      c.priority === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    }`}
                  >
                    {c.priority} PRIORITY
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    AI: {c.ai_category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{c.description}</p>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    c.status === "RESOLVED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : c.status === "INVESTIGATING"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                  }`}
                >
                  {c.status}
                </span>

                {c.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, "RESOLVED")}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40 transition-all text-xs font-orbitron"
                  >
                    DISPATCH &amp; RESOLVE
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Report ID: #{c.id} &bull; Associated Node: {c.bin_id ? `Bin #${c.bin_id}` : "General Area"}</span>
              <span>Reported: {new Date(c.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
