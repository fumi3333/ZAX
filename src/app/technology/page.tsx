"use client";

import { motion } from "framer-motion";
import { Cpu, Network, Database, Layers, Code, ShieldCheck } from "lucide-react";

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

                {/* Tech Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {/* 1. AI Core */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                <Cpu size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">AI Core Intelligence</h3>
                            <ul className="space-y-4">
                                <li className="flex flex-col">
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">Reasoning Model</span>
                                    <span className="font-mono font-bold text-lg">Google Gemini 1.5 Pro</span>
                                    <p className="text-sm text-slate-500 mt-1">
                                        ユーザーの断片的な入力から「本質（Essence）」を抽出し、CoT（思考の連鎖）を用いて推論プロセスを生成。
                                    </p>
                                </li>
                                <li className="flex flex-col border-t border-slate-100 pt-4">
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">Vectorization</span>
                                    <span className="font-mono font-bold text-lg">Hugging Face / Embedding-001</span>
                                    <p className="text-sm text-slate-500 mt-1">
                                        言語化された本質データを768次元のベクトル空間へマッピング。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* 2. Mathematical Logic */}
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
                            <h3 className="text-2xl font-bold mb-4">Mathematical Logic</h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1 block">Algorithm</span>
                                    <span className="font-bold text-lg block mb-2">Cosine Similarity (余弦類似度)</span>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-600">
                                        similarity = (A · B) / (||A|| ||B||)
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-1 block">Feature Space</span>
                                    <span className="font-bold text-lg block mb-2">Dual-Vector Architecture</span>
                                    <p className="text-sm text-slate-500">
                                        <b className="text-slate-900">Display Vector (6d):</b> 可視化・UI用（直感、論理、共感等）<br />
                                        <b className="text-slate-900">Essence Vector (768d):</b> 深層マッチング計算用（隠れ層）
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Infrastructure */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden group md:col-span-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                                    <Database size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Infrastructure & Data</h3>
                                <p className="text-slate-500 mb-6">
                                    大規模なベクトル検索とセキュアなデータ管理を実現する、モダンなデータスタックを採用しています。
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Database size={16} className="text-slate-400" />
                                            <span className="font-bold text-sm">PostgreSQL + pgvector</span>
                                        </div>
                                        <div className="text-xs text-slate-400">Vector Storage</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck size={16} className="text-slate-400" />
                                            <span className="font-bold text-sm">RLS Policies</span>
                                        </div>
                                        <div className="text-xs text-slate-400">Row Level Security</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-8">
                                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Frontend Stack</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <Layers size={18} className="text-slate-400" />
                                        <span className="font-mono text-sm">Next.js 14 (App Router)</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Code size={18} className="text-slate-400" />
                                        <span className="font-mono text-sm">React Server Components</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        </div>
                                        <span className="font-mono text-sm">Tailwind CSS + Framer Motion</span>
                                    </li>
                                </ul>
                            </div>
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
