import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { BinData, VehicleData } from "../services/api";

interface HolographicMapProps {
  bins: BinData[];
  vehicles?: VehicleData[];
  selectedBin?: BinData | null;
  onSelectBin?: (bin: BinData) => void;
  routeCoordinates?: [number, number][];
}

export const HolographicMap: React.FC<HolographicMapProps> = ({
  bins,
  vehicles = [],
  selectedBin,
  onSelectBin,
  routeCoordinates = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered at Bengaluru Tech Hub
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Dark Matter Cyber Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &amp; OSM',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom cyber zoom control in bottom-left
      L.control.zoom({ position: "bottomleft" }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear old markers
    markersLayer.clearLayers();

    // Render 30 Smart Dustbins
    bins.forEach((b) => {
      let colorHex = "#00ff9d"; // low
      let glowClass = "glow-green";
      if (b.priority === "CRITICAL" || b.current_fill_pct >= 90) {
        colorHex = "#ff0055";
        glowClass = "glow-red animate-pulse";
      } else if (b.priority === "HIGH" || b.current_fill_pct >= 80) {
        colorHex = "#ffaa00";
        glowClass = "glow-amber";
      } else if (b.current_fill_pct >= 50) {
        colorHex = "#00f0ff";
        glowClass = "glow-cyan";
      }

      // Futuristic pulsing SVG HTML marker
      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-8 h-8 rounded-full border border-[${colorHex}] opacity-40 animate-ping"></div>
          <div class="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-black shadow-lg" style="background: ${colorHex}; box-shadow: 0 0 12px ${colorHex};">
            ${Math.round(b.current_fill_pct)}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: "custom-cyber-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([b.latitude, b.longitude], { icon });

      // Holographic Popup
      const popupContent = `
        <div style="background: #090e1f; color: #f1f5f9; padding: 10px; border-radius: 8px; border: 1px solid #00f0ff; font-family: Outfit, sans-serif; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #00f0ff; font-family: Orbitron, sans-serif;">${b.code}</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${colorHex}22; color: ${colorHex}; border: 1px solid ${colorHex}; font-weight: bold;">
              ${b.priority}
            </span>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${b.location_name}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; font-family: monospace;">
            <div>Fill: <strong style="color: ${colorHex}">${b.current_fill_pct}%</strong></div>
            <div>Weight: <strong>${b.current_weight_kg} kg</strong></div>
            <div>Temp: <strong>${b.temperature_c}°C</strong></div>
            <div>Gas: <strong>${b.gas_ppm} ppm</strong></div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #38bdf8;">Status: ${b.status} (${b.bin_health})</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        onSelectBin?.(b);
      });

      markersLayer.addLayer(marker);
    });

    // Render Vehicles (Smart Collection Fleet)
    vehicles.forEach((v) => {
      const vehicleHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-mono text-[10px] shadow-neon-cyan animate-bounce">
            🚛
          </div>
        </div>
      `;
      const vIcon = L.divIcon({
        html: vehicleHtml,
        className: "cyber-truck-marker",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const vMarker = L.marker([v.latitude, v.longitude], { icon: vIcon });
      vMarker.bindPopup(`
        <div style="background: #090e1f; color: #f1f5f9; padding: 8px; border-radius: 6px; border: 1px solid #38bdf8;">
          <strong style="color: #38bdf8;">${v.vehicle_no}</strong>
          <div style="font-size: 11px;">Driver: ${v.driver_name}</div>
          <div style="font-size: 11px;">Load: ${v.current_load_kg}/${v.capacity_kg} kg</div>
          <div style="font-size: 11px;">Fuel/Battery: ${v.fuel_pct}%</div>
        </div>
      `);
      markersLayer.addLayer(vMarker);
    });

    // Render Polyline Route if available
    if (routeCoordinates.length > 1) {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }
      const polyline = L.polyline(routeCoordinates, {
        color: "#00f0ff",
        weight: 3.5,
        opacity: 0.85,
        dashArray: "6, 8",
      }).addTo(map);
      routeLayerRef.current = polyline;
    }
  }, [bins, vehicles, onSelectBin, routeCoordinates]);

  // Pan to selected bin if provided
  useEffect(() => {
    if (selectedBin && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedBin.latitude, selectedBin.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [selectedBin]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/30 cyber-glass shadow-glass">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-orbitron text-cyan-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        HOLOGRAPHIC GPS GRID // BENGALURU SECTOR 01
      </div>
    </div>
  );
};
