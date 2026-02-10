"use client";

import { motion } from "framer-motion";
import { Cpu, Network, Database, Layers, Code, ShieldCheck } from "lucide-react";
import VectorTransformationVisual from "@/components/VectorTransformationVisual";

export default function TechnologyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900">
            {/* Background Noise */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-50/50 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-50/50 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 border border-slate-200 rounded-full bg-white text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                        TECHNICAL REPORT 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 text-slate-900">
                        ZAX TECHNOLOGY STACK
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        「感覚」を「計算」へ。<br />
                        ZAXを支えるアーキテクチャと数理モデルの全貌。
                    </p>
                </motion.div>

                {/* Tech Grid - Google Cloud Native Narrative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {/* 1. Cognitive Architecture (The "Brain") */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group md:col-span-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu size={120} />
                        </div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-10">
                            <div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <Cpu size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Cognitive Architecture</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">
                                    人間の「直感（System 1）」と「論理（System 2）」を模倣したハイブリッド推論モデル。
                                    Google Cloud Vertex AI 上で稼働する Gemini 1.5 Pro が、断片的な言葉からユーザーの深層心理を言語化します。
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="font-bold text-slate-700 text-sm">System 2 (Logic):</span>
                                        <span className="font-mono text-sm text-slate-500">Vertex AI / Gemini 1.5 Pro</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span className="font-bold text-slate-700 text-sm">System 1 (Intuition):</span>
                                        <span className="font-mono text-sm text-slate-500">768-dim Vector Space</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Context Window</div>
                                        <div className="font-mono text-xl text-slate-900">1,000,000+ Tokens</div>
                                    </div>
                                    <div className="w-full h-px bg-slate-200" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Reasoning Method</div>
                                        <div className="font-mono text-sm text-slate-900">Chain-of-Thought (CoT) + Zero-shot</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Mathematical Foundation */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-purple-900/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Network size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                                <Network size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Vector Resonance</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                言語化された「本質」を高次元ベクトルへ変換し、ユークリッド距離や余弦類似度を用いて「共鳴率」を算出します。
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-600">
                                similarity = (A · B) / (||A|| ||B||)
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Scalable Infrastructure (Google Cloud) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                                <Database size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Hyper-Scalable Infra</h3>
                            <ul className="space-y-4">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1 block">Compute</span>
                                    <span className="font-bold text-sm block mb-1">Google Cloud Run (Serverless)</span>
                                    <p className="text-xs text-slate-500">Auto-scaling containers, zero maintenance.</p>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1 block">Database</span>
                                    <span className="font-bold text-sm block mb-1">PostgreSQL + pgvector</span>
                                    <p className="text-xs text-slate-500">Hybrid Search (Vector + Keyword) enabled.</p>
                                </div>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Section */}
                <div className="text-center border-t border-slate-200 pt-16 mb-24">
                    <p className="text-slate-400 text-sm mb-4">
                        This architecture allows for real-time resonance calculation<br />
                        while maintaining user privacy and data integrity.
                    </p>
                    <div className="inline-flex gap-2 text-xs font-mono text-slate-300">
                        <span>LATENCY: &lt;100ms</span>
                        <span>|</span>
                        <span>UPTIME: 99.9%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
