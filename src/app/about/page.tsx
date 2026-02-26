"use client";

import { motion } from "framer-motion";
import { Globe, Building2, Sparkles, Lightbulb, BarChart3, Database } from "lucide-react";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import ImpactChart from "@/components/ImpactChart";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* 背景のアンビエント効果 */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* 縦スクロールレイアウト */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12" style={{ paddingTop: '160px' }}>

                {/* ───────────────────────────────────────────── */}
                {/* [A] HERO — タイトルセクション */}
                {/* ───────────────────────────────────────────── */}
                <motion.section 
                    className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-xs font-mono font-bold tracking-[0.3em] text-indigo-500 mb-8 uppercase">Vision</div>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-slate-900">
                        Restoring<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Human Resonance
                        </span>
                    </h1>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [B] INFO GRID — 基本情報 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Building2, label: "Entity", value: "ZAX R.I." },
                            { icon: Sparkles, label: "Mission", value: "Value Connection" },
                            { icon: Lightbulb, label: "Vision", value: "Total Happiness" },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 p-8 md:p-10 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-200 transition-colors duration-300">
                                <item.icon className="w-8 h-8 text-blue-600 mb-4" />
                                <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-wider">{item.label}</div>
                                <div className="text-lg md:text-xl font-bold text-slate-800">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [C] PHILOSOPHY 1 — 構造的な機会損失 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-white border border-slate-100 rounded-[32px] p-12 md:p-16 relative overflow-hidden group shadow-lg shadow-slate-200/50 flex flex-col justify-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-slate-100 mb-4">01</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">構造的な機会損失</h3>
                        <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                            私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。
                            その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまう...
                            これこそが、人生最大の機会損失です。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [D] PHILOSOPHY 2 — 潜在意識へのアクセス */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[32px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 背景デコレーション */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-white/10 mb-4">02</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">潜在意識へのアクセス</h3>
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化します。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [E] EVIDENCE — 客観的事実としての「幸福と経済」 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 text-blue-600">
                            <Database size={24} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            客観的事実としての<br className="md:hidden" />「幸福と経済」
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            World Happiness Report 2019のデータを用いた実証分析。
                            GDPと幸福度の相関(<span className="font-mono font-bold text-blue-600">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
                        </p>
                    </div>
                    
                    {/* チャートとエビデンス — 縦積み */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 h-[450px] shadow-sm">
                            <ImpactChart />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
                            <div className="text-slate-900">
                                <EvidenceAnalysis />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [F] REFERENCES — データソース */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-slate-900 text-white rounded-[32px] p-10 md:p-16"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8">Data Sources & References</h4>
                    <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-400 font-mono leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-0.5">▸</span>
                                World Happiness Report 2019
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-0.5">▸</span>
                                The World Bank (GDP per capita)
                            </li>
                        </ul>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
