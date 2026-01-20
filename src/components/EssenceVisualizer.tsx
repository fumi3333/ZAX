"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface EssenceVisualizerProps {
    vector?: number[];
}

export default function EssenceVisualizer({ vector }: EssenceVisualizerProps) {
    // Default mock initialization
    const [points, setPoints] = useState([50, 50, 50, 50, 50, 50]);

    useEffect(() => {
        if (vector && vector.length === 6) {
            // If vector is provided, animate to it
            setPoints(vector);
        } else {
            // Simulate data analysis updating the vector points if no vector yet
            const interval = setInterval(() => {
                setPoints(points.map(() => Math.random() * 80 + 20));
            }, 800);
            return () => clearInterval(interval);
        }
    }, [vector]); // Check dependency

    const polyPoints = points.map((val, i) => {
        const angle = (Math.PI * 2 * i) / 6; // 6 dimensions
        const x = 100 + val * Math.cos(angle);
        const y = 100 + val * Math.sin(angle);
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64">
                {/* Radar Background */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30">
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
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                    <motion.polygon
                        points={polyPoints}
                        fill="rgba(112, 0, 255, 0.3)"
                        stroke="#00F0FF"
                        strokeWidth="2"
                        animate={{ points: polyPoints }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                className="mt-8 text-zax-glow font-mono text-sm tracking-widest"
            >
                {vector ? "ESSENCE CRYSTALLIZED" : "ANALYZING ESSENCE VECTORS..."}
            </motion.p>
        </div>
    );
}
