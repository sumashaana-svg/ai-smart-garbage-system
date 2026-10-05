import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BinData } from "../services/api";

interface AntiGravity3DProps {
  bins: BinData[];
  selectedBinId?: number;
  onSelectBin?: (bin: BinData) => void;
}

export const AntiGravity3D: React.FC<AntiGravity3DProps> = ({
  bins,
  selectedBinId,
  onSelectBin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredBin, setHoveredBin] = useState<BinData | null>(null);
  const [activeCameraMode, setActiveCameraMode] = useState<"ORBIT" | "TOP" | "CLOSEUP">("ORBIT");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040711, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 4, 60);
    pointLight.position.set(0, 12, 0);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0x9d4edd, 3, 50);
    purpleLight.position.set(-15, 8, -10);
    scene.add(purpleLight);

    // 3. Cyber Platform Ground Grid (Anti-Gravity Base)
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Concentric glowing rings on floor
    const ringGeo = new THREE.RingGeometry(3, 3.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -3.95;
    scene.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(12, 12.3, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x9d4edd, side: THREE.DoubleSide });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = -3.95;
    scene.add(outerRing);

    // 4. Center Hologram Levitating Core Smart-Bin
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Bin Body (Glass Cylinder)
    const binBodyGeo = new THREE.CylinderGeometry(2, 1.7, 4.5, 32);
    const binBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transmission: 0.8,
      opacity: 0.85,
      transparent: true,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0x003344,
      emissiveIntensity: 0.5
    });
    const binMesh = new THREE.Mesh(binBodyGeo, binBodyMat);
    coreGroup.add(binMesh);

    // Internal Glowing Waste Level Cylinder
    const wasteFillGeo = new THREE.CylinderGeometry(1.85, 1.55, 3.0, 32);
    const wasteFillMat = new THREE.MeshStandardMaterial({
      color: 0x00ff9d,
      emissive: 0x00ff9d,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const wasteMesh = new THREE.Mesh(wasteFillGeo, wasteFillMat);
    wasteMesh.position.y = -0.7;
    coreGroup.add(wasteMesh);

    // Levitating Magnetic Lid (Anti-Gravity Floating above bin)
    const lidGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.4, 32);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = 3.2; // Hovering with air gap
    coreGroup.add(lidMesh);

    // Neon Halo Ring around hovering lid
    const lidHaloGeo = new THREE.TorusGeometry(2.4, 0.08, 16, 64);
    const lidHaloMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const lidHalo = new THREE.Mesh(lidHaloGeo, lidHaloMat);
    lidHalo.rotation.x = Math.PI / 2;
    lidHalo.position.y = 3.2;
    coreGroup.add(lidHalo);

    // 5. Orbital Floating Satellite Smart-Bins (representing City Network)
    const binMeshMap = new Map<number, THREE.Group>();
    const raycastTargets: THREE.Object3D[] = [];
    const radius = 12;
    const sampleBins = bins.slice(0, 16);

    sampleBins.forEach((b, idx) => {
      const angle = (idx / sampleBins.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 1.5;

      const satGroup = new THREE.Group();
      satGroup.position.set(x, y, z);
      satGroup.userData = { binData: b };

      // Determine color by fill / priority
      let hexColor = 0x00ff9d; // green
      if (b.priority === "CRITICAL" || b.current_fill_pct >= 90) {
        hexColor = 0xff0055; // critical neon pink/red
      } else if (b.priority === "HIGH" || b.current_fill_pct >= 80) {
        hexColor = 0xffaa00; // amber
      } else if (b.current_fill_pct >= 50) {
        hexColor = 0x00f0ff; // cyan
      }

      // Small Floating Bin Body
      const miniGeo = new THREE.CylinderGeometry(0.7, 0.55, 1.6, 16);
      const miniMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: b.priority === "CRITICAL" ? 1.5 : 0.6,
        roughness: 0.3,
        metalness: 0.5
      });
      const miniMesh = new THREE.Mesh(miniGeo, miniMat);
      satGroup.add(miniMesh);

      // Orbiting levitation ring
      const miniRingGeo = new THREE.TorusGeometry(1.0, 0.04, 8, 32);
      const miniRingMat = new THREE.MeshBasicMaterial({ color: hexColor });
      const miniRing = new THREE.Mesh(miniRingGeo, miniRingMat);
      miniRing.rotation.x = Math.PI / 2;
      satGroup.add(miniRing);

      scene.add(satGroup);
      binMeshMap.set(b.id, satGroup);
      raycastTargets.push(miniMesh);
    });

    // 6. Upward Drifting Anti-Gravity Waste Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const speedArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 35;
      posArray[i * 3 + 1] = Math.random() * 20 - 4;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 35;
      speedArray[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Raycaster for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);
      if (intersects.length > 0) {
        const parent = intersects[0].object.parent;
        if (parent && parent.userData.binData) {
          onSelectBin?.(parent.userData.binData);
        }
      }
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);

    // 8. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Levitating vertical oscillation for center smart bin
      coreGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.4;
      coreGroup.rotation.y = elapsedTime * 0.3;

      // Lid anti-gravity bobbing
      lidMesh.position.y = 3.2 + Math.sin(elapsedTime * 3.0) * 0.15;
      lidHalo.position.y = lidMesh.position.y;

      // Rotate Satellite Bins along Orbit
      binMeshMap.forEach((group, _) => {
        group.rotation.y = elapsedTime * 0.5;
        group.position.y += Math.sin(elapsedTime * 2 + group.position.x) * 0.005;
      });

      // Drift Particles Upward (Anti-Gravity simulation)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += speedArray[i];
        if (positions[i * 3 + 1] > 18) {
          positions[i * 3 + 1] = -4; // Reset to ground
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Raycast Hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);
      if (intersects.length > 0) {
        const parent = intersects[0].object.parent;
        if (parent && parent.userData.binData) {
          setHoveredBin(parent.userData.binData);
        }
      } else {
        setHoveredBin(null);
      }

      // Smooth Camera Rotation
      if (activeCameraMode === "ORBIT") {
        camera.position.x = Math.sin(elapsedTime * 0.15) * 28;
        camera.position.z = Math.cos(elapsedTime * 0.15) * 28;
        camera.lookAt(0, 2, 0);
      } else if (activeCameraMode === "TOP") {
        camera.position.set(0, 32, 0.1);
        camera.lookAt(0, 0, 0);
      } else if (activeCameraMode === "CLOSEUP") {
        camera.position.set(0, 4, 10);
        camera.lookAt(0, 2, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [bins, activeCameraMode, onSelectBin]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden cyber-glass border border-cyan-500/30 group">
      {/* ThreeJS Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD Hologram Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-orbitron text-cyan-300 uppercase tracking-wider">
          3D Anti-Gravity Levitation Matrix
        </span>
        <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-1.5 rounded">
          60 FPS
        </span>
      </div>

      {/* Top Right Camera Mode Switcher */}
      <div className="absolute top-4 right-4 flex space-x-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-cyan-500/30">
        {(["ORBIT", "TOP", "CLOSEUP"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveCameraMode(mode)}
            className={`px-2.5 py-1 text-[11px] font-orbitron rounded transition-all ${
              activeCameraMode === mode
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Interactive Tooltip on Hover */}
      {hoveredBin && (
        <div className="absolute bottom-4 left-4 pointer-events-none bg-slate-950/90 backdrop-blur-xl border border-cyan-400/60 p-3 rounded-xl shadow-neon-cyan text-xs max-w-xs animate-fadeIn">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="font-orbitron font-bold text-cyan-300">{hoveredBin.code}</span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                hoveredBin.priority === "CRITICAL"
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : hoveredBin.priority === "HIGH"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
              }`}
            >
              {hoveredBin.priority}
            </span>
          </div>
          <p className="text-slate-300 truncate">{hoveredBin.location_name}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div>Fill: <span className="text-cyan-300 font-bold">{hoveredBin.current_fill_pct}%</span></div>
            <div>Temp: <span className="text-slate-200">{hoveredBin.temperature_c}°C</span></div>
            <div>Gas: <span className="text-slate-200">{hoveredBin.gas_ppm} ppm</span></div>
            <div>Weight: <span className="text-slate-200">{hoveredBin.current_weight_kg} kg</span></div>
          </div>
          <div className="mt-1 text-[10px] text-cyan-400/70 italic">Click node to inspect telemetry</div>
        </div>
      )}

      {/* Bottom Right Legend */}
      <div className="absolute bottom-4 right-4 pointer-events-none flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;50%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> 50-80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> &gt;80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical</span>
      </div>
    </div>
  );
};
