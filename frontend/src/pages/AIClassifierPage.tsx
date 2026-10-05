import React, { useState } from "react";
import { api, WasteClassificationResult } from "../services/api";
import { Sparkles, Upload, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Cpu } from "lucide-react";
import { hudSound } from "../utils/sound";

export const AIClassifierPage: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<string>("plastic_bottle");
  const [classification, setClassification] = useState<WasteClassificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Gallery of representative waste images
  const sampleImages = [
    { id: "plastic_bottle", label: "PET Plastic Bottle", category: "Plastic", img: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80" },
    { id: "organic_banana", label: "Organic Food Waste", category: "Organic", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80" },
    { id: "aluminum_can", label: "Crushed Soda Can", category: "Metal", img: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80" },
    { id: "cardboard_box", label: "Corrugated Paper Box", category: "Paper", img: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80" },
    { id: "glass_bottle", label: "Glass Beverage Bottle", category: "Glass", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80" },
    { id: "lithium_battery", label: "E-Waste Circuit Board", category: "E-waste", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" },
    { id: "chemical_paint", label: "Hazardous Chemical Can", category: "Hazardous waste", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
    { id: "mixed_refuse", label: "Unsegregated Refuse", category: "Mixed waste", img: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=400&q=80" },
  ];

  const handleClassify = async (sampleId: string) => {
    setSelectedSample(sampleId);
    setIsAnalyzing(true);
    hudSound.playBeep(980);
    try {
      const target = sampleImages.find((s) => s.id === sampleId);
      const res = await api.classifyWaste({
        image_name: `${target?.category.toLowerCase()}_sample.jpg`,
        image_url: target?.img,
      });
      setClassification(res);
      hudSound.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial classification on mount
  React.useEffect(() => {
    handleClassify("plastic_bottle");
  }, []);

  const currentSample = sampleImages.find((s) => s.id === selectedSample);

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-cyan-300 tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            COMPUTER VISION AI WASTE CLASSIFICATION LAB
          </h2>
          <p className="text-xs text-slate-400">
            Real-time material inference &bull; 8 Segregation Classes &bull; Circular Recyclability Analysis
          </p>
        </div>

        <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          Model: <strong>CV Feature Extractor v2.4 (PyTorch Compatible)</strong>
        </div>
      </div>

      {/* Main Classifier Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Image Preview & Sample Gallery (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Image Visualizer */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/30 relative">
            <div className="relative h-64 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950">
              <img
                src={currentSample?.img}
                alt="Selected Sample"
                className="w-full h-full object-cover"
              />
              {/* Futuristic Bounding Box & HUD Crosshairs */}
              <div className="absolute inset-4 border border-dashed border-cyan-400 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between items-center text-[10px] text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur">
                  <span>AI REGION OF INTEREST (ROI)</span>
                  <span>98.4% BOUNDS</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur">
                  <span>TARGET: {currentSample?.label}</span>
                  <span>SPECTRAL MATCH: OK</span>
                </div>
              </div>
            </div>

            {/* Re-analyze Button */}
            <button
              onClick={() => handleClassify(selectedSample)}
              disabled={isAnalyzing}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-orbitron font-bold text-xs shadow-neon-cyan hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "EXTRACTING SPECTRAL FEATURES..." : "RE-ANALYZE IMAGE WITH AI"}</span>
            </button>
          </div>

          {/* Sample Presets Gallery */}
          <div className="cyber-glass rounded-2xl p-4 border border-cyan-500/20">
            <span className="text-xs font-orbitron text-slate-300 uppercase block mb-3">
              SELECT BENCHMARK WASTE IMAGE:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleImages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleClassify(s.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedSample === s.id
                      ? "border-cyan-400 bg-cyan-950/40 shadow-neon-cyan"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <img src={s.img} alt={s.label} className="w-full h-14 object-cover rounded-lg mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-200 block truncate">{s.category}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Inference Results & Circular Recommendation (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {classification && (
            <>
              {/* Category & Confidence Badge */}
              <div className="cyber-glass-glow rounded-2xl p-5 border border-cyan-400 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-orbitron text-slate-400 uppercase tracking-wider">
                    DETECTED CLASSIFICATION
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      classification.is_recyclable
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-neon-green"
                        : "bg-red-500/20 text-red-400 border-red-500/50 shadow-neon-pink"
                    }`}
                  >
                    {classification.is_recyclable ? "RECYCLABLE" : "NON-RECYCLABLE"}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-300">
                    {classification.detected_category}
                  </span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {classification.confidence_pct}% AI Confidence
                  </span>
                </div>

                {/* Disposal Guidance */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30 text-xs">
                  <span className="text-[10px] text-cyan-400 uppercase block font-bold mb-1">
                    RECOMMENDED DISPOSAL PROTOCOL:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {classification.disposal_method}
                  </p>
                </div>
              </div>

              {/* Material Probability Distribution */}
              <div className="cyber-glass rounded-2xl p-5 border border-cyan-500/20 space-y-3">
                <h3 className="font-orbitron font-bold text-xs text-slate-300 uppercase">
                  CONFIDENCE PROBABILITY BREAKDOWN
                </h3>

                <div className="space-y-2">
                  {Object.entries(classification.material_breakdown || {}).map(([cat, score]) => (
                    <div key={cat} className="text-xs">
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className={cat === classification.detected_category ? "text-cyan-300 font-bold" : "text-slate-400"}>
                          {cat}
                        </span>
                        <span className="text-slate-300 font-mono">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            cat === classification.detected_category ? "bg-cyan-400 shadow-neon-cyan" : "bg-slate-700"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
