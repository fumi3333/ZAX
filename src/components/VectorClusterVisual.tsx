"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Simplified 3D Cluster Visualization
export default function VectorClusterVisual() {
    // Generate random nodes for the cluster
    const [nodes, setNodes] = useState<{ x: number; y: number; z: number; color: string; size: number }[]>([]);

    useEffect(() => {
        const newNodes = [];
        // Cluster 1: Logic Types (Blue)
        for (let i = 0; i < 20; i++) {
            newNodes.push({
                x: 30 + Math.random() * 40,
                y: 30 + Math.random() * 40,
                z: Math.random() * 20,
                color: "#00f0ff",
                size: 2 + Math.random() * 3
            });
        }
        // Cluster 2: Creative Types (Purple)
        for (let i = 0; i < 20; i++) {
            newNodes.push({
                x: 130 + Math.random() * 40,
                y: 130 + Math.random() * 40,
                z: Math.random() * 20,
                color: "#7000ff",
                size: 2 + Math.random() * 3
            });
        }
        // Resonance Bridge (Connecting Lines)
        setNodes(newNodes);
    }, []);

    return (
        <div className="relative w-full h-[400px] bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-zax-accent shadow-[0_0_8px_#00f0ff]"></div>
                    <span className="text-[10px] text-zax-accent uppercase tracking-widest font-mono">Cluster A: Logic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zax-glow shadow-[0_0_8px_#7000ff]"></div>
                    <span className="text-[10px] text-zax-glow uppercase tracking-widest font-mono">Cluster B: Intuition</span>
                </div>
            </div>

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] perspective-[1000px] rotate-x-60" />

            {/* Nodes */}
            {nodes.map((node, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: node.x * 2,
                        top: node.y,
                        width: node.size,
                        height: node.size,
                        backgroundColor: node.color,
                        boxShadow: `0 0 ${node.size * 2}px ${node.color}`
                    }}
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                    }}
                />
            ))}

            {/* Resonance Connection (The "Bridge") */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.line
                    x1="20%" y1="20%"
                    x2="70%" y2="70%"
                    stroke="url(#gradient-line)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7000ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* 3D Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-black/80 px-4 py-2 rounded border border-white/20 backdrop-blur-md"
                >
                    <span className="text-xs font-bold text-white tracking-widest">RESONANCE DETECTED</span>
                    <div className="text-[10px] text-white/50 font-mono mt-1">Similarity: 0.9842</div>
                </motion.div>
            </div>
        </div>
    );
}
