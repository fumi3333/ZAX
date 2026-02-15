"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface EssenceVisualizerProps {
    vector?: number[];
    interactive?: boolean;
}

export default function EssenceVisualizer({ vector, interactive = true }: EssenceVisualizerProps) {
    // Default mock initialization
    const [points, setPoints] = useState([50, 50, 50, 50, 50, 50]);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (vector && vector.length === 6) {
            setPoints(vector);
        }
    }, [vector]);

    const handleSliderChange = (index: number, value: number) => {
        const newPoints = [...points];
        newPoints[index] = value;
        setPoints(newPoints);
    };

    const polyPoints = useMemo(() => {
        return points.map((val, i) => {
            const angle = (Math.PI * 2 * i) / 6; // 6 dimensions
            const x = 100 + val * Math.cos(angle);
            const y = 100 + val * Math.sin(angle);
            return `${x},${y}`;
        }).join(" ");
    }, [points]);

    const labels = ["Logic", "Intuition", "Empathy", "Ethics", "Passion", "Resilience"];

    return (
        <div 
            className="flex flex-col items-center justify-center p-4 relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Radar Background */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zax-muted" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zax-muted" />
                    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zax-muted" />
                    {[0, 1, 2, 3, 4, 5].map(i => {
                        const angle = (Math.PI * 2 * i) / 6;
                        const x = 100 + 90 * Math.cos(angle);
                        const y = 100 + 90 * Math.sin(angle);
                        return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-zax-muted" />;
                    })}
                </svg>

                {/* Dynamic Vector Shape */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] pointer-events-none">
                    <motion.polygon
                        points={polyPoints}
                        fill="rgba(59, 130, 246, 0.3)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        animate={{ points: polyPoints }}
                        transition={{ duration: interactive ? 0.1 : 0.8, ease: "easeInOut" }}
                    />
                </svg>
                
                {/* Interactive Sliders (Circular Positioning) */}
                {interactive && (
                    <div className="absolute inset-0 w-full h-full">
                        {points.map((val, i) => {
                            const angle = (Math.PI * 2 * i) / 6;
                            // Position sliders outside the circle
                            const left = 50 + 50 * Math.cos(angle) * 1.35; 
                            const top = 50 + 50 * Math.sin(angle) * 1.35;
                            
                            return (
                                <div 
                                    key={i}
                                    className="absolute w-24 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group/slider"
                                    style={{ left: `${left}%`, top: `${top}%` }}
                                >
                                    <span className="text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase tracking-wider bg-white/80 px-1 rounded backdrop-blur-sm">
                                        {labels[i]}
                                    </span>
                                    <input
                                        type="range"
                                        min="10"
                                        max="90"
                                        value={val}
                                        onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer hover:bg-slate-300 transition-colors accent-blue-600"
                                    />
                                    <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                        {Math.round(val)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 text-slate-400 font-mono text-xs tracking-widest uppercase"
            >
                {interactive ? "DRAG SLIDERS TO RESHAPE" : (vector ? "本質の結晶" : "ANALYZING ESSENCE VECTORS...")}
            </motion.p>
        </div>
    );
}
