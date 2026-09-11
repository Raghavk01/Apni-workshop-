import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Video,
  Radio,
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface CameraFeed {
  id: string;
  name: string;
  bayNumber: string;
  technician: string;
  angle: string;
  resolution: string;
  bitrate: string;
  fps: number;
  imageUrl: string;
}

const cameraFeeds: CameraFeed[] = [
  {
    id: "cam-1",
    name: "Bay 03 - Hydraulic Under-Lift & Suspension Cam",
    bayNumber: "Bay 03",
    technician: "Rajesh Sharma (Lead Master Mechanic)",
    angle: "Wide Angle 4K Under-Chassis",
    resolution: "3840x2160 (4K)",
    bitrate: "5.2 Mbps",
    fps: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cam-2",
    name: "Bay 01 - Engine Compartment & Diagnostics",
    bayNumber: "Bay 01",
    technician: "Amit Verma (Powertrain Specialist)",
    angle: "Macro Top-Down Hood Angle",
    resolution: "1920x1080 (1080p)",
    bitrate: "3.8 Mbps",
    fps: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cam-3",
    name: "Bay 04 - Ceramic Coating & Paint Booth",
    bayNumber: "Bay 04",
    technician: "Sunil Kumar (Detailing Lead)",
    angle: "High-CRI Color True Lighting",
    resolution: "3840x2160 (4K)",
    bitrate: "6.0 Mbps",
    fps: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cam-4",
    name: "Valet Cam - Roadside Transit Dashcam",
    bayNumber: "Valet Unit 02",
    technician: "Anoop Kumar (Valet Pilot)",
    angle: "Front & Cabin Dual Dashcam",
    resolution: "1920x1080 (1080p)",
    bitrate: "2.4 Mbps",
    fps: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
  },
];

export const LiveBayStreamModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, bookingInfo, showToast } = useApp();
  const [activeCamId, setActiveCamId] = useState<string>("cam-1");
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isNightVision, setIsNightVision] = useState(false);
  const [streamQuality, setStreamQuality] = useState<"4K" | "1080p" | "720p">("4K");
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [liveLatency, setLiveLatency] = useState(94);

  // Live latency jitter simulation
  useEffect(() => {
    if (!isModalOpen.liveBayStream) return;
    const interval = setInterval(() => {
      setLiveLatency(Math.floor(88 + Math.random() * 18));
    }, 2000);
    return () => clearInterval(interval);
  }, [isModalOpen.liveBayStream]);

  if (!isModalOpen.liveBayStream) return null;

  const currentCam = cameraFeeds.find((c) => c.id === activeCamId) || cameraFeeds[0];

  const handleCaptureSnapshot = () => {
    const timestamp = new Date().toLocaleTimeString();
    setSnapshots((prev) => [
      `Bay Snapshot @ ${timestamp} (${currentCam.bayNumber})`,
      ...prev.slice(0, 3),
    ]);
    showToast(`📸 High-Res Frame Captured & Saved to Service Inspection Record!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={() => closeModal("liveBayStream")}
    >
      <div
        className="bg-[#1b1c17] text-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#12130e] p-3.5 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse">
              <Video size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[15px] tracking-tight">
                  WebRTC Live Bay CCTV Stream
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>LIVE • {liveLatency}ms</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {vehicle.name} ({vehicle.plate}) • {currentCam.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("liveBayStream")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative bg-black aspect-video sm:h-[360px] overflow-hidden flex items-center justify-center select-none">
          {/* Main Video Stream Frame */}
          <img
            src={currentCam.imageUrl}
            alt={currentCam.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isNightVision ? "brightness-125 contrast-150 grayscale invert" : ""
            }`}
          />

          {/* OSD (On-Screen Display) Overlay */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60">
            {/* Top OSD Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/90">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <span className="text-rose-400 animate-pulse font-sans">● REC</span>
                <span>{currentCam.bayNumber}</span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-400">{currentCam.resolution}</span>
              </div>

              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <span>{currentCam.fps} FPS</span>
                <span className="text-slate-400">|</span>
                <span className="text-sky-400">{currentCam.bitrate}</span>
              </div>
            </div>

            {/* Bottom OSD Bar */}
            <div className="flex items-center justify-between text-[11px] text-white">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-sans">Active Technician:</span>
                <span className="font-bold text-white text-[12px]">{currentCam.technician}</span>
              </div>

              {/* In-Video Quick Action Controls */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                {/* Intercom Audio */}
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                    isAudioMuted
                      ? "bg-black/60 border-white/20 text-slate-400 hover:text-white"
                      : "bg-emerald-600 border-emerald-400 text-white"
                  }`}
                  title={isAudioMuted ? "Unmute Mechanic Mic" : "Mute Mic"}
                >
                  {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Night Vision / IR Mode */}
                <button
                  onClick={() => setIsNightVision(!isNightVision)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                    isNightVision
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg"
                      : "bg-black/60 border-white/20 text-slate-400 hover:text-white"
                  }`}
                  title="Toggle IR / High-Contrast Inspection Filter"
                >
                  <Eye size={16} />
                </button>

                {/* Instant Snapshot */}
                <button
                  onClick={handleCaptureSnapshot}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Camera size={14} />
                  <span>Snap Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Camera Channel Switcher */}
        <div className="p-3 bg-[#12130e] border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold uppercase tracking-wider">Switch Workshop Camera Angles</span>
            <div className="flex items-center gap-1">
              {(["4K", "1080p", "720p"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setStreamQuality(q)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    streamQuality === q ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cameraFeeds.map((cam) => (
              <div
                key={cam.id}
                onClick={() => setActiveCamId(cam.id)}
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 ${
                  activeCamId === cam.id
                    ? "bg-[#0d631b]/30 border-emerald-500 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeCamId === cam.id ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Video size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-white truncate leading-tight">
                    {cam.bayNumber}
                  </h4>
                  <span className="text-[9px] text-slate-400 block truncate">{cam.angle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Captured Snapshots History */}
          {snapshots.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[10px]">
              <span className="text-slate-500 font-bold shrink-0">Captured Frames:</span>
              {snapshots.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-emerald-300 border border-slate-700 px-2.5 py-0.5 rounded-md whitespace-nowrap"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
