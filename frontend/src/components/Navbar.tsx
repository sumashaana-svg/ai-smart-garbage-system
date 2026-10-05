import React, { useState } from "react";
import {
  Shield, Truck, User, Cpu, Sparkles, Volume2, VolumeX,
  Play, Radio, Bell
} from "lucide-react";
import { hudSound } from "../utils/sound";

interface NavbarProps {
  currentRole: "admin" | "worker" | "citizen";
  onRoleChange: (role: "admin" | "worker" | "citizen") => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  iotConnected: boolean;
  onTriggerDemoFlow: () => void;
  isDemoRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  iotConnected,
  onTriggerDemoFlow,
  isDemoRunning = false,
}) => {
  const [isMuted, setIsMuted] = useState(hudSound.getIsMuted());

  const handleSoundToggle = () => {
    const muted = hudSound.toggleMute();
    setIsMuted(muted);
    if (!muted) hudSound.playBeep(920);
  };

  const navItems = {
    admin: [
      { id: "dashboard", label: "3D Command" },
      { id: "bins", label: "Smart Bins (30)" },
      { id: "routes", label: "AI Routes" },
      { id: "analytics", label: "Analytics" },
      { id: "vehicles", label: "Fleet" },
      { id: "complaints", label: "Complaints" },
      { id: "classifier", label: "AI Classifier" },
      { id: "predictions", label: "ML Forecasts" },
    ],
    worker: [
      { id: "worker-dash", label: "Assigned Route" },
      { id: "worker-bins", label: "Bin Collector HUD" },
      { id: "worker-history", label: "Shift History" },
      { id: "classifier", label: "Waste AI Scanner" },
    ],
    citizen: [
      { id: "citizen-dash", label: "Citizen Hub" },
      { id: "report", label: "Report Overflow" },
      { id: "nearby", label: "Nearby Bins" },
      { id: "rewards", label: "Green Rewards" },
      { id: "classifier", label: "Recycle AI Scanner" },
    ],
  };

  return (
    <header className="sticky top-3 z-50 px-4 mb-4">
      <div className="max-w-7xl mx-auto cyber-glass-glow rounded-2xl px-4 py-2.5 border border-cyan-500/40 shadow-neon-cyan flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-neon-cyan animate-pulse-slow">
            <span className="text-xl">🛸</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-200">
                ANTI-GRAVITY
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                AI SMART CITY 2050
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Predict &bull; Optimize &bull; Collect &bull; Recycle
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1 max-w-full">
          {navItems[currentRole].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                hudSound.playBeep(750, 0.05);
                onTabChange(item.id);
              }}
              className={`px-3 py-1.5 text-xs font-orbitron rounded-xl transition-all whitespace-nowrap ${
                activeTab === item.id
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-neon-cyan font-bold"
                  : "text-slate-300 hover:text-cyan-200 hover:bg-slate-800/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side: Role Selector, Status & Demo Trigger */}
        <div className="flex items-center gap-2">
          {/* 1-Click End-to-End Demo Flow Trigger Button */}
          <button
            onClick={() => {
              hudSound.playLevitate();
              onTriggerDemoFlow();
            }}
            disabled={isDemoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-orbitron text-xs font-bold shadow-neon-pink hover:scale-105 active:scale-95 transition-all border border-pink-400/50"
            title="Execute the complete citizen -> AI -> route -> worker collection loop"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isDemoRunning ? "DEMO FLOW..." : "RUN DEMO FLOW"}</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => {
                hudSound.playBeep(800);
                onRoleChange("admin");
                onTabChange("dashboard");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-orbitron transition-all ${
                currentRole === "admin"
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => {
                hudSound.playBeep(800);
                onRoleChange("worker");
                onTabChange("worker-dash");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-orbitron transition-all ${
                currentRole === "worker"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-400/60 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Worker</span>
            </button>
            <button
              onClick={() => {
                hudSound.playBeep(800);
                onRoleChange("citizen");
                onTabChange("citizen-dash");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-orbitron transition-all ${
                currentRole === "citizen"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/60 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
          </div>

          {/* Telemetry Status Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-mono">
            <Radio className={`w-3.5 h-3.5 ${iotConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span className={iotConnected ? "text-emerald-300" : "text-amber-300"}>
              {iotConnected ? "IoT LIVE" : "CONNECTING"}
            </span>
          </div>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
            title={isMuted ? "Unmute HUD Audio" : "Mute HUD Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
