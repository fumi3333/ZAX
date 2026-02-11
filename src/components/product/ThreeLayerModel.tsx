"use client";

import { motion } from "framer-motion";

export default function ThreeLayerModel() {
  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col justify-end items-center py-8">
      
      {/* Layer 3: Delta (High Frequency) */}
      <div className="relative w-48 h-16 mb-4 z-30">
        <motion.div 
          className="absolute inset-0 bg-emerald-500/20 border border-emerald-400/50 rounded-lg backdrop-blur-sm"
          animate={{ 
            boxShadow: ["0 0 10px rgba(16, 185, 129, 0.2)", "0 0 20px rgba(16, 185, 129, 0.6)", "0 0 10px rgba(16, 185, 129, 0.2)"],
            borderColor: ["rgba(52, 211, 153, 0.5)", "rgba(52, 211, 153, 1)", "rgba(52, 211, 153, 0.5)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-300 font-bold font-mono tracking-widest text-sm">LAYER 3: Δ</span>
        </div>
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                    x: (Math.random() - 0.5) * 100, 
                    y: (Math.random() - 0.5) * 50, 
                    opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                style={{ top: '50%', left: '50%' }}
            />
        ))}
      </div>

      {/* Layer 2: Merge (Fluid) */}
      <div className="relative w-56 h-24 mb-1 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 border-x border-t border-blue-500/30 rounded-t-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-200/70 font-bold font-mono tracking-widest text-sm">LAYER 2: MERGE</span>
        </div>
        {/* Connecting Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-500/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-blue-500/20" />
      </div>

      {/* Layer 1: Core (Solid) */}
      <div className="relative w-64 h-32 z-10 glass-panel border border-indigo-500/30 bg-slate-900/80 rounded-xl shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-900/20 rounded-xl" />
        <div className="text-center">
            <div className="text-indigo-400 font-black text-xl tracking-widest mb-1">CORE</div>
            <div className="text-[10px] text-indigo-300/50 font-mono">IMMUTABLE LOGIC</div>
        </div>
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />
      </div>

      {/* Central Axis */}
      <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />

    </div>
  );
}
