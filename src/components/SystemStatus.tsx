"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SystemStatus() {
  const [time, setTime] = useState("");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Update time
    const interval = setInterval(() => {
      const so = new Date();
      setTime(so.toISOString().split("T")[1].split(".")[0]);
    }, 1000);

    // Track mouse for "Radar" effect
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden text-[10px] font-mono text-slate-500/50 tracking-widest mix-blend-difference">
      {/* Top Left: System ID */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-400">ZAX-OS v0.9.4</span>
        <span>SYS: ONLINE</span>
        <span>NET: SECURE (TLS 1.3)</span>
      </div>

      {/* Top Right: Time & Pulse */}
      <div className="absolute top-4 right-4 text-right flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-400">{time}</span>
        <span className="flex items-center justify-end gap-2">
          LIVE FEED <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse" />
        </span>
      </div>

      {/* Bottom Left: Coordinates */}
      <div className="absolute bottom-4 left-4">
        <div>PTR: X{coords.x.toString().padStart(4, "0")} Y{coords.y.toString().padStart(4, "0")}</div>
        <div>MEM: 24.5GB / 64GB</div>
      </div>

      {/* Bottom Right: Decorative Hex */}
      <div className="absolute bottom-4 right-4 text-right">
        <div>ENC: AES-256</div>
        <div>LAT: 35.6895° N</div>
        <div>LNG: 139.6917° E</div>
      </div>

      {/* Center Crosshair (Subtle) */}
      <div className="absolute top-1/2 left-1/2 w-[20px] h-[20px] -translate-x-1/2 -translate-y-1/2 border border-slate-500/20 rounded-full flex items-center justify-center">
        <div className="w-[2px] h-[2px] bg-slate-500/50" />
      </div>
      
      {/* Edge Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-slate-500/50 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-t from-slate-500/50 to-transparent" />
    </div>
  );
}
