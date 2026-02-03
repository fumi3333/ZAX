"use client";

import { motion } from "framer-motion";
import { Globe, Building2, Sparkles, Lightbulb, BarChart3, Database } from "lucide-react";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import ImpactChart from "@/components/ImpactChart";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* Ambient Background (Light Mode) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40">
                {/* Hero Section */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-1.5 mb-8 border border-slate-200 rounded-full bg-white/50 backdrop-blur-md text-[10px] tracking-[0.3em] font-medium text-slate-500"
                    >
                        WHO WE ARE
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black leading-none tracking-tighter mb-8 text-slate-900"
                    >
                        Restoring<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Human Resonance
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-light"
                    >
                        ZAX Research Initiativeは、人類の孤独を解決し、<br className="hidden md:block" />
                        本質的な繋がりを再構築するための研究機関です。
                    </motion.p>
                </div>

                {/* Grid Info */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-32"
                >
                    {[
                        { icon: Building2, label: "Entity", value: "ZAX R.I." },
                        { icon: Globe, label: "HQ", value: "Musashino, Tokyo" },
                        { icon: Sparkles, label: "Mission", value: "Value Connection" },
                        { icon: Lightbulb, label: "Vision", value: "Total Happiness" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                            <item.icon className="w-6 h-6 text-blue-600 mb-4" />
                            <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">{item.label}</div>
                            <div className="text-sm md:text-base font-bold text-slate-800">{item.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Core Philosophy Highlights (Light Cards) */}
                <div className="grid md:grid-cols-2 gap-8 mb-32">
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white border border-slate-100 rounded-[32px] p-10 relative overflow-hidden group shadow-lg shadow-slate-200/50"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">構造的な機会損失</h3>
                        <p className="text-slate-600 leading-relaxed relative z-10">
                            私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。
                            その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまう...
                            これこそが、人生最大の機会損失です。
                        </p>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white border border-slate-100 rounded-[32px] p-10 relative overflow-hidden group shadow-lg shadow-slate-200/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">潜在意識へのアクセス</h3>
                        <p className="text-slate-600 leading-relaxed relative z-10">
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化します。
                        </p>
                    </motion.section>
                </div>

                {/* Evidence Section (Light) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-[40px] p-8 md:p-16 text-center shadow-inner"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-6 text-blue-600 mx-auto">
                        <Database size={20} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">客観的事実としての「幸福と経済」</h2>
                    <p className="text-slate-500 mb-12 max-w-2xl mx-auto">
                        World Happiness Report 2019のデータを用いた実証分析。
                        GDPと幸福度の相関(<span className="font-mono font-bold text-blue-600">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-12 text-left">
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 h-[400px] shadow-sm">
                            <ImpactChart />
                        </div>
                        <div className="bg-white rounded-2xl p-6 overflow-hidden shadow-sm border border-slate-100">
                             <div className="text-slate-900">
                                <EvidenceAnalysis />
                             </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer References (Light) */}
                <div className="border-t border-slate-200 pt-12 mt-24">
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-8">Data Sources & References</h4>
                    <div className="grid md:grid-cols-2 gap-8 text-[10px] text-slate-500 font-mono leading-relaxed">
                        <ul className="space-y-4">
                            <li>World Happiness Report 2019</li>
                            <li>The World Bank (GDP per capita)</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
