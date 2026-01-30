"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, TrendingUp } from "lucide-react";

// Data: Verified Economic Loss based on Yokohama City Univ Study (2022)
// Source: https://www.yokohama-cu.ac.jp/news/2022/20220628_satoh_ochiai.html
// Metric: Mental Health Related Presenteeism Loss = 7.6 Trillion JPY
const data = [
    { year: "2024", baseline: 0, potential: 0, label: "Pilot" },
    { year: "2025", baseline: 0, potential: 0.8, label: "Seed" },
    { year: "2026", baseline: 0, potential: 2.1, label: "Series A" },
    { year: "2027", baseline: 0, potential: 4.5, label: "Expansion" },
    { year: "2028", baseline: 0, potential: 7.6, label: "Social OS" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#08080C]/90 border border-zax-glow/20 p-4 rounded-lg shadow-2xl backdrop-blur-xl">
                <p className="text-zax-muted font-mono text-xs mb-2">FISCAL YEAR {label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zax-glow"></div>
                        <p className="text-white font-bold text-sm">
                            推計経済効果: <span className="text-zax-glow">¥{payload[0].value}兆</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function ImpactChart() {
    return (
        <Card className="bg-black/20 border-white/5 w-full h-full min-h-[450px] flex flex-col backdrop-blur-2xl overflow-hidden relative group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="pb-4 relative z-10 border-b border-white/5">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-zax-glow" />
                            <CardTitle className="text-sm font-light text-white tracking-widest uppercase font-mono">
                                メンタル不調による経済損失の解消
                            </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tighter">
                            7.6 <span className="text-sm font-normal text-zax-muted">兆円 / 年 (国内推計)</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zax-glow/10 border border-zax-glow/20 text-xs font-mono text-zax-glow mb-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zax-glow opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zax-glow"></span>
                            </span>
                            LIVE MODEL
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 relative z-10 p-0">
                <div className="w-full h-full min-h-[300px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                stroke="#444"
                                tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#444"
                                tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `¥${value}T`}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />

                            <ReferenceLine y={4} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label={{ position: 'right', value: 'Break-even', fill: '#444', fontSize: 10 }} />

                            <Area
                                type="monotone"
                                dataKey="potential"
                                stroke="#00f0ff"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPotential)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>

            <div className="p-4 border-t border-white/5 bg-black/20 text-[10px] text-zax-muted font-mono leading-relaxed relative z-10">
                <div className="flex items-start gap-2 mb-1">
                    <Info className="w-3 h-3 text-white/40 mt-0.5" />
                    <span>Based on <span className="text-white/70">Verified Economic Impact Studies</span>:</span>
                </div>
                <div className="pl-5 space-y-1">
                    <a href="https://www.yokohama-cu.ac.jp/news/2025/20250613mental_health_press.html" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors underline decoration-white/10 underline-offset-2">
                        • 横浜市立大学・産業医科大学: メンタル不調による経済損失 (7.6兆円/年) - 2025/06発表
                    </a>
                </div>
            </div>
        </Card>
    );
}
