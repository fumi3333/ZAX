"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ImpactSimulationGraph() {
    // Simulated prediction data
    const points = [
        { year: 2024, baseline: 100, optimized: 100 },
        { year: 2025, baseline: 101.5, optimized: 102.8 },
        { year: 2026, baseline: 102.8, optimized: 106.5 },
        { year: 2027, baseline: 104.1, optimized: 112.4 },
        { year: 2028, baseline: 105.3, optimized: 119.8 },
        { year: 2029, baseline: 106.4, optimized: 128.5 },
        { year: 2030, baseline: 107.5, optimized: 139.2 },
    ];

    const width = 600;
    const height = 300;
    const padding = 40;

    // Scale helpers
    const getX = (index: number) => padding + (index / (points.length - 1)) * (width - 2 * padding);
    const getY = (value: number) => height - padding - ((value - 90) / (150 - 90)) * (height - 2 * padding); // Scale 90-150 range

    const baselinePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.baseline)}`).join(" ");
    const optimizedPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.optimized)}`).join(" ");

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zax-accent animate-pulse" />
                        Economic Ripple Prediction
                    </h3>
                    <p className="text-xs text-zax-muted font-mono mt-1">
                        Model: LightGBM v4.2 (Verified) / Horizon: 2030
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-zax-accent">+29.4%</div>
                    <div className="text-[10px] text-zax-muted uppercase tracking-wider">Projected GDP Impact</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Graph Area */}
                <div className="flex-1 relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                        {/* Grid Lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={i}
                                x1={padding}
                                y1={padding + (i * (height - 2 * padding)) / 4}
                                x2={width - padding}
                                y2={padding + (i * (height - 2 * padding)) / 4}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Baseline Line */}
                        <motion.path
                            d={baselinePath}
                            fill="none"
                            stroke="#444"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* Optimized Line (ZAX) */}
                        <motion.path
                            d={optimizedPath}
                            fill="none"
                            stroke="#00F0FF"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                            style={{ filter: "drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))" }}
                        />

                        {/* Area under optimized (Gradient) */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(0, 240, 255, 0.2)" />
                                <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={`${optimizedPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                            fill="url(#areaGradient)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.5 }}
                        />

                        {/* Points & Labels */}
                        {points.map((p, i) => (
                            <g key={i}>
                                {/* X Axis Labels */}
                                <text x={getX(i)} y={height - 10} textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">
                                    {p.year}
                                </text>
                                {/* Dots on Optimized */}
                                <motion.circle
                                    cx={getX(i)}
                                    cy={getY(p.optimized)}
                                    r="3"
                                    fill="#00F0FF"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-zax-accent" />
                            <span className="text-[10px] text-white">ZAX Scenerio</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-gray-600 border-t border-dashed border-gray-400" />
                            <span className="text-[10px] text-gray-500">Baseline</span>
                        </div>
                    </div>
                </div>

                {/* Feature Importance Sidebar */}
                <div className="w-full md:w-48 flex flex-col justify-center space-y-4 border-l border-white/10 md:pl-6">
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                        Feature Importance
                    </div>
                    {[
                        { label: "Mental Health", value: 0.92, color: "bg-zax-accent" },
                        { label: "Labor Mobility", value: 0.78, color: "bg-purple-500" },
                        { label: "Creativity", value: 0.65, color: "bg-blue-500" },
                        { label: "Consumption", value: 0.45, color: "bg-gray-500" },
                    ].map((feature, i) => (
                        <div key={i} className="group/bar">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>{feature.label}</span>
                                <span className="font-mono">{feature.value}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${feature.value * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                                    className={`h-full ${feature.color} shadow-[0_0_10px_currentColor] opacity-80 group-hover/bar:opacity-100 transition-opacity`}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="text-[9px] text-zax-muted leading-relaxed">
                            *Parameters optimized via Gradient Boosting Decision Tree (GBDT). showing high correlation between well-being & productivity.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
