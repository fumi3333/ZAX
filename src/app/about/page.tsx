"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Building2, Users, Rocket } from "lucide-react";
import Link from "next/link";
import ImpactChart from "@/components/ImpactChart";
import VectorClusterVisual from "@/components/VectorClusterVisual"; // Reuse visuals

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background - Light & Airy */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/40 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/40 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">

                {/* Header: Company Profile Style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 border border-blue-200 rounded-full bg-white text-[10px] tracking-[0.2em] text-blue-600 uppercase shadow-sm">
                        WHO WE ARE
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-slate-900">
                        ABOUT US
                    </h1>
                    <p className="text-slate-600 max-w-lg mx-auto text-lg">
                        ZAX Research Initiativeは、人類の孤独を解決し、<br />
                        本質的な繋がりを再構築するための研究機関です。
                    </p>
                </motion.div>

                {/* Company Profile Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32"
                >
                    {[
                        { icon: Building2, label: "Entity", value: "ZAX R.I." },
                        { icon: Globe, label: "HQ", value: "Musashino, Tokyo" },
                        { icon: Users, label: "Members", value: "12 Researchers" },
                        { icon: Rocket, label: "Founded", value: "2026.04" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                            <item.icon className="w-6 h-6 text-blue-500 mb-3" />
                            <div className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">{item.label}</div>
                            <div className="font-bold text-slate-800">{item.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Divider */}
                <div className="border-t border-slate-200 mb-24" />

                {/* PHILOSOPHY SECTION (Integrated Manifesto) */}
                <div id="philosophy" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-block px-4 py-1.5 mb-6 border border-slate-200 rounded-full bg-slate-100 text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                            OUR PHILOSOPHY
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-8">
                            死ぬ時に「幸福だった」と<br />
                            言い切るために
                        </h2>
                    </motion.div>

                    {/* Section 1: My Original Experience */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto"
                    >
                        <span className="font-mono text-xs text-blue-500 tracking-widest mb-4 block">01. 原体験</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">構造的な機会損失</h3>
                        <p>
                            私個人の究極の目標は、人生の終わりに「この人生は幸福だった」と心から思えることです。しかし、現在の社会構造を見渡したとき、多くの人がその機会を構造的に奪われているのではないかと感じています。
                        </p>
                        <p>
                            私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまったり、目先の記号的な条件で繋がりを選んでしまったりすることで、大きな機会損失が生まれていると考えています。
                        </p>
                    </motion.section>

                    {/* Section 2: Subconscious & Happiness Maximization */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 mx-auto max-w-none"
                    >
                        <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto">
                            <span className="font-mono text-xs text-blue-500 tracking-widest mb-4 block">02. 幸福の最大化</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">潜在意識へのアクセス</h3>
                            <p>
                                真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っていると私は信じています。
                                ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化することを目的としたシステムです。
                            </p>
                            <ul className="list-none pl-0 space-y-2 mt-4 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <li><strong className="text-slate-900">・潜在意識の解析：</strong> ユーザー自身も言語化できていない「心地よさ」や「価値観」をデータとして抽出します。</li>
                                <li><strong className="text-slate-900">・長期目線での最適化：</strong> 一過性の盛り上がりではなく、人生単位で互いを高め合える「共鳴」を演算します。</li>
                            </ul>
                            <p className="mt-6">
                                このシステムの目的関数は、単なるマッチングの成立ではなく、「ユーザー個人の長期的な幸福量（<span className="font-serif italic font-bold text-slate-900">H<sub>long-term</sub></span>）の最大化」であると考えています。
                            </p>
                        </div>

                        {/* Math Visual - Light Mode */}
                        <div className="flex justify-center my-12">
                            <div className="bg-white border border-slate-200 px-10 py-8 rounded-2xl shadow-lg shadow-blue-500/5">
                                <span className="font-serif text-2xl md:text-3xl text-slate-900 italic tracking-wider">
                                    Maximize <span className="mx-2 text-blue-600">∑</span> H<sub className="text-sm text-slate-500">t</sub>(V<sub className="text-sm text-slate-500">subconscious</sub>)
                                </span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section 3: Chain of Thought */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto"
                    >
                        <span className="font-mono text-xs text-blue-500 tracking-widest mb-4 block">03. 納得の共有</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Chain of Thought</h3>
                        <p>
                            また、ZAXにおいては「なぜこの人と響き合うのか」というプロセスも大切にしたいと考えています。
                            AIがユーザーの潜在意識をどう解釈したのか、その思考の推論プロセス（Chain of Thought）を共有することで、ユーザーは自分自身の新しい一面に気づくことができます。
                        </p>
                        <div className="border-l-4 border-blue-500/30 pl-6 my-6 italic text-slate-500 bg-white/50 py-2">
                            「このCoTが生み出す『納得感』こそが、属性の壁を超えて深く繋がるための土台になると確信しています。」
                        </div>
                    </motion.section>

                    {/* Section 4: Innovation as Byproduct */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 mx-auto"
                    >
                        <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto mb-12">
                            <span className="font-mono text-xs text-blue-500 tracking-widest mb-4 block">04. 副産物としてのイノベーション</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">個人の幸福が社会を変える</h3>
                            <p>
                                個々人が自分にとって最適な場所、最適なパートナー、そして真の自己に繋がることができたとき、その社会は勝手に良くなっていくはずです。
                            </p>
                        </div>

                        {/* Chart as "Evidence of Byproduct" - Light Mode Wrapper */}
                        <div className="mt-8 mb-12 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Economic Impact Simulation</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                </div>
                            </div>
                            <div className="h-[400px] w-full p-6">
                                {/* Note: ImpactChart handles its own text styling. We might need to ensure it's legible in light mode or force dark mode within the chart container if it relies on white text. */}
                                {/* For now, wrapping it in a dark container to preserve the specific technical aesthetic, or asking permission to edit ImpactChart. */}
                                {/* Actually, the user asked for "Brighter". Let's wrap it in a slightly contrasting container. */}
                                <div className="w-full h-full bg-[#111] rounded-xl overflow-hidden relative">
                                    <ImpactChart />
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto">
                            <p>
                                こうした社会の発展やイノベーションは、あくまで<strong className="text-slate-900">「個人の幸福を追求した結果」</strong>として現れる副産物に過ぎないというのが私の考えです。
                                ZAXが何よりも優先するのは、あなたという個人が、あなたの人生を肯定できる「接続」を提供することです。
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 5: Future with BMI */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-32 prose prose-slate prose-lg text-slate-600 leading-relaxed mx-auto"
                    >
                        <span className="font-mono text-xs text-blue-500 tracking-widest mb-4 block">05. 未来へ</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">BMIが普及した世界に向けて</h3>
                        <p>
                            今はまだスマートフォンを通じたインターフェースですが、このZAXという構想は、将来的にBMI（脳マシンインタフェース）が普及した世の中で、さらに真価を発揮できると確信しています。
                        </p>
                        <p>
                            言葉や属性といったフィルターを完全に脱ぎ捨て、心と心が直接響き合う。
                            そんな、誰もが自分の人生を幸福だと思える未来を、私は作っていきたいと考えています。
                        </p>
                    </motion.section>
                </div>

                <div className="mt-20 text-center pb-20">
                    <Link href="/" className="group relative inline-flex items-center gap-4 text-white bg-slate-900 hover:bg-blue-600 border border-transparent px-10 py-5 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30">
                        <span className="text-sm tracking-widest uppercase">プロトコルを開始 (Start)</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div >
        </div >
    );
}
