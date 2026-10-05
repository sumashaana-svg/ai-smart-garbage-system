import React, { useEffect, useState } from "react";
import { CheckCircle2, Play, Sparkles, Truck, ShieldAlert, Check } from "lucide-react";
import { hudSound } from "../utils/sound";

interface DemoFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoData: any;
}

export const DemoFlowModal: React.FC<DemoFlowModalProps> = ({
  isOpen,
  onClose,
  demoData,
}) => {
  const [currentActiveStep, setCurrentActiveStep] = useState(0);

  useEffect(() => {
    if (isOpen && demoData?.steps) {
      setCurrentActiveStep(0);
      hudSound.playAlert();
      // Animate step by step
      demoData.steps.forEach((_: any, idx: number) => {
        setTimeout(() => {
          setCurrentActiveStep(idx + 1);
          if (idx === demoData.steps.length - 1) {
            hudSound.playSuccess();
          } else {
            hudSound.playBeep(700 + idx * 40, 0.05);
          }
        }, (idx + 1) * 450);
      });
    }
  }, [isOpen, demoData]);

  if (!isOpen || !demoData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="cyber-glass-glow max-w-xl w-full p-6 rounded-3xl border border-cyan-400 space-y-4 font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="font-orbitron font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
              ANTI-GRAVITY END-TO-END DEMO FLOW EXECUTION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Demonstrating autonomous multi-agent synchronization across Citizen &bull; AI Classifier &bull; Predictive ML &bull; Route Dispatcher &bull; Collection Worker:
        </p>

        {/* 10 Step Progress List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
          {(demoData.steps || []).map((s: any, idx: number) => {
            const isCompleted = idx < currentActiveStep;
            const isCurrent = idx === currentActiveStep - 1;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-cyan-950/60 border-cyan-400 shadow-neon-cyan scale-[1.01]"
                    : isCompleted
                    ? "bg-slate-950/70 border-emerald-500/40 text-slate-200"
                    : "bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isCompleted
                          ? "bg-emerald-500 text-black"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                    </span>
                    <span className="font-orbitron font-bold text-slate-200">{s.title}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isCompleted && !isCurrent && (
                    <span className="text-[10px] font-mono text-emerald-400">DONE</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 pl-7">{s.details}</div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400">
            {currentActiveStep >= (demoData.steps?.length || 10)
              ? "All 10 steps successfully verified & executed!"
              : "Synchronizing IoT Telemetry & Database..."}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-orbitron font-bold text-xs shadow-neon-cyan hover:scale-105 transition-all"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    </div>
  );
};
