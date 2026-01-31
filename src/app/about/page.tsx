"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Building2, Sparkles, Brain, Network, Lightbulb, Rocket, BarChart3, Database } from "lucide-react";
import Link from "next/link";
import ImpactChart from "@/components/ImpactChart";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import VectorClusterVisual from "@/components/VectorClusterVisual"; // Reuse visuals

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#333] font-sans pb-40 selection:bg-blue-100 selection:text-blue-900">
            {/* 1. Impact Hero Section */}
            <div className="relative bg-slate-900 text-white pt-40 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-1.5 mb-8 border border-white/20 rounded-full bg-white/10 backdrop-blur-md text-xs tracking-[0.2em] font-medium"
                    >
                        WHO WE ARE
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-8"
                    >
                        Restoring<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                            Human Resonance
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-300 max-w-2xl mx-auto text-xl leading-relaxed font-light"
                    >
                        ZAX Research Initiativeは、人類の孤独を解決し、<br className="hidden md:block" />
                        本質的な繋がりを再構築するための研究機関です。
                    </motion.p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 space-y-24">

                {/* Company Profile Grid (Card Style) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 gap-4"
                >
                    {[
                        { icon: Building2, label: "Entity", value: "ZAX R.I." },
                        { icon: Globe, label: "HQ", value: "Musashino, Tokyo" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[24px] shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                            <item.icon className="w-8 h-8 text-blue-600 mb-4" />
                            <div className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">{item.label}</div>
                            <div className="text-lg font-bold text-slate-800">{item.value}</div>
                        </div>
                    ))}
                </motion.div>


                {/* PHILOSOPHY SECTION */}
                <div>
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold tracking-widest text-xs uppercase block mb-4">Our Philosophy</span>
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            死ぬ時に「幸福だった」と<br />言い切るために
                        </h2>
                    </div>

                    {/* Card 1: Origin */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[32px] p-10 md:p-14 shadow-xl shadow-slate-200/50 mb-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                            <Sparkles size={200} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Lightbulb size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">構造的な機会損失</h3>
                        </div>
                        <div className="prose prose-lg text-slate-600 leading-loose">
                            <p>
                                私個人の究極の目標は、人生の終わりに「この人生は幸福だった」と心から思えることです。しかし、現在の社会構造を見渡したとき、多くの人がその機会を構造的に奪われているのではないかと感じています。
                            </p>
                            <p>
                                私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまう...これこそが、人生最大の機会損失です。
                            </p>
                        </div>
                    </motion.section>

                    {/* Card 2: Subconscious */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[32px] p-10 md:p-14 shadow-xl shadow-slate-200/50 mb-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                            <Brain size={200} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Brain size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">潜在意識へのアクセス</h3>
                        </div>
                        <div className="prose prose-lg text-slate-600 leading-loose mb-12">
                            <p>
                                真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っています。
                                ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化します。
                            </p>
                        </div>

                        {/* Math Visual */}
                        <div className="relative group rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 p-12 flex justify-center">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 blur opacity-20 group-hover:opacity-40 transition duration-500" />
                            <span className="relative font-serif text-3xl md:text-4xl text-slate-900 italic tracking-wider z-10">
                                Maximize <span className="mx-3 text-purple-600">∑</span> H<sub className="text-lg text-slate-500">t</sub>(V<sub className="text-lg text-slate-500">subconscious</sub>)
                            </span>
                        </div>
                    </motion.section>

                    {/* Card 3: Chain of Thought */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 text-white rounded-[32px] p-10 md:p-14 shadow-xl shadow-blue-900/20 mb-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.1]">
                            <Network size={200} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-200">
                                    <Network size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">思考の連鎖 (Chain of Thought)</h3>
                            </div>
                            <div className="prose prose-lg prose-invert leading-loose">
                                <p className="text-slate-300">
                                    計算資源の拡大により、高次元のデータを扱えるようになったことが、このプロジェクトの根幹にあります。
                                    従来不可能だった「人間の複雑な内面」をデータとして処理できるようになったことで、初めて真の共鳴を演算することが可能になりました。
                                </p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 italic text-blue-200 font-medium text-lg">
                                「圧倒的な計算力が、人の心の機微という『見えない変数』を可視化するのです。」
                            </div>
                        </div>
                    </motion.section>

                    {/* Card 4: Innovation */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[32px] p-10 md:p-14 shadow-xl shadow-slate-200/50 mb-16"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">個人の幸福が社会を変える</h3>
                        </div>

                        <div className="prose prose-lg text-slate-600 leading-loose mb-10">
                            <p>
                                社会の発展やイノベーションは、あくまで<strong className="text-slate-900">「個人の幸福を追求した結果」</strong>として現れる副産物に過ぎません。
                                ZAXが何よりも優先するのは、あなたという個人が、あなたの人生を肯定できる「接続」を提供することです。
                            </p>
                        </div>

                        {/* Chart Wrapper */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Economic Impact Simulation</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                            </div>
                            <div className="h-[350px] w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
                                <ImpactChart />
                            </div>
                        </div>
                    </motion.section>

                    {/* Card 5: Future */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-10 md:p-14 shadow-xl shadow-blue-100/50 mb-24 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.05]">
                            <Rocket size={200} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Rocket size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">BMIが普及した世界に向けて</h3>
                        </div>
                        <div className="prose prose-lg text-slate-600 leading-loose">
                            <p>
                                今はまだスマートフォンを通じたインターフェースですが、このZAXという構想は、将来的にBMI（脳マシンインタフェース）が普及した世の中で、さらに真価を発揮できると確信しています。
                            </p>
                            <p>
                                言葉や属性といったフィルターを完全に脱ぎ捨て、心と心が直接響き合う。
                                そんな、誰もが自分の人生を幸福だと思える未来を、私は作っていきたいと考えています。
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 6: Real Data Verification (Full Width) */}
                    <div className="mb-24">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4 text-slate-600">
                                <Database size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">客観的事実としての「幸福と経済」</h3>
                            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
                                World Happiness Report 2019のデータセットを用いた実証分析。
                                GDPと幸福度の相関(<span className="font-mono font-bold text-blue-600">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
                            </p>
                        </div>
                        <EvidenceAnalysis />
                    </div>

                    {/* References (Simple & Clean) */}
                    <div className="border-t border-slate-200 pt-12">
                        <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8">Data Sources & References</h4>
                        <div className="grid md:grid-cols-2 gap-8 text-xs text-slate-500 font-mono leading-relaxed">
                            <ul className="space-y-4">
                                <li className="hover:text-slate-800 transition-colors">
                                    <strong className="block text-slate-700">World Happiness Report 2019</strong>
                                    <a href="https://worldhappiness.report/ed/2019/" className="break-all border-b border-slate-200 hover:border-blue-400">https://worldhappiness.report/ed/2019/</a>
                                </li>
                                <li className="hover:text-slate-800 transition-colors">
                                    <strong className="block text-slate-700">The World Bank (GDP per capita)</strong>
                                    <a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD" className="break-all border-b border-slate-200 hover:border-blue-400">https://data.worldbank.org/indicator/NY.GDP.PCAP.CD</a>
                                </li>
                            </ul>
                            <ul className="space-y-4">
                                <li className="hover:text-slate-800 transition-colors">
                                    <strong className="block text-slate-700">LightGBM Documentation</strong>
                                    <a href="https://lightgbm.readthedocs.io/" className="break-all border-b border-slate-200 hover:border-blue-400">https://lightgbm.readthedocs.io/</a>
                                </li>
                                <li className="hover:text-slate-800 transition-colors">
                                    <strong className="block text-slate-700">pandas documentation</strong>
                                    <a href="https://pandas.pydata.org/docs/" className="break-all border-b border-slate-200 hover:border-blue-400">https://pandas.pydata.org/docs/</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
