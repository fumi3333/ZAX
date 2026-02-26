"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroVisual() {
    const [nodes, setNodes] = useState<{ x: number; y: number; size: number; color: string; delay: number }[]>([]);

    useEffect(() => {
        // Generate a dense cloud of "potential connections"
        const newNodes = [];
        for (let i = 0; i < 40; i++) {
            newNodes.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 2 + Math.random() * 4,
                color: Math.random() > 0.5 ? "#00f0ff" : "#ffffff",
                delay: Math.random() * 2
            });
        }
        setNodes(newNodes);
    }, []);

    return (
        <div className="relative w-full h-[300px] md:h-[400px] max-w-2xl mx-auto overflow-hidden rounded-full opacity-80 mix-blend-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zax-glow/10 to-transparent blur-xl" />

            {/* Central Core Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-zax-glow/20 rounded-full blur-[80px] animate-pulse-slow" />

            {/* Orbiting Nodes */}
            {nodes.map((node, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full shadow-[0_0_10px_currentColor]"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: node.size,
                        height: node.size,
                        backgroundColor: node.color,
                        opacity: 0.6
                    }}
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: node.delay
                    }}
                />
            ))}

            {/* Connecting Lines (Simulated) */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <motion.path
                    d="M 100 200 Q 200 100 300 200 T 500 200"
                    fill="none"
                    stroke="url(#hero-gradient)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                    <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
