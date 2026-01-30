"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-[#08080C] text-white selection:bg-zax-glow/30 selection:text-zax-glow font-sans pb-40 overflow-x-hidden">
            {/* Ambient Background - Warm & Organic */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[180px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-slate-900/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A10]/50 to-[#08080C]" />
            </div>

            {/* Navigation removed - moved to Global Layout */}

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-48">
                {/* Header - Editorial Style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="mb-32 text-center md:text-left"
                >
                    <div className="inline-block px-4 py-1.5 mb-8 border border-zax-glow/30 rounded-full bg-zax-glow/10 text-[10px] tracking-[0.2em] text-zax-glow uppercase shadow-[0_0_20px_rgba(112,0,255,0.2)]">
                        ZAX POLICY & PHILOSOPHY
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                        人類を、<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zax-glow via-white to-zax-accent">
                            一つの知性体へ。
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-zax-muted leading-relaxed max-w-2xl border-l-2 border-white/10 pl-6 ml-1 mt-10">
                        属性の壁を壊し、魂の本質で接続する。<br />
                        これは、孤独な「点」を、温かい「線」へと変える試みです。
                    </p>
                </motion.div>

                {/* Section 1: The Bug - Glitch Aesthetic */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 relative pl-8 md:pl-12 border-l border-white/10 hover:border-red-500/50 transition-colors duration-500 group"
                >
                    <div className="absolute left-[-5px] top-0 h-0 w-[1px] bg-red-500 group-hover:h-full transition-all duration-700 ease-in-out" />

                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                        <span className="font-mono text-sm text-red-500 tracking-widest bg-red-500/10 px-2 py-1 rounded">01. 課題 (THE BUG)</span>
                        既存社会のバグ
                    </h2>
                    <div className="prose prose-invert prose-lg text-zax-muted leading-loose">
                        <p className="mb-6">
                            現在の社会において、人間同士の繋がりは「大学名」「職業」「年収」「外見」といった、記号化された<strong className="text-white bg-white/5 px-1">「属性 (Attributes)」</strong>によって支配されています。
                        </p>
                        <p>
                            しかし、人間という存在は、そんな数個のラベルで定義できるほど単純ではありません。これら低次元なデータに基づくマッチングは、私たちの本質的な孤独を癒やすどころか、むしろ「条件による分断」を加速させる<span className="text-red-400 font-medium">社会の脆弱性</span>であると、私たちは考えます。
                        </p>
                    </div>
                </motion.section>

                import VectorTransformationVisual from "@/components/VectorTransformationVisual";

                {/* Section 2: The Solution - Technology Aesthetic */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-40 relative pl-8 md:pl-12 border-l border-white/5 hover:border-zax-glow/30 transition-colors duration-700 max-w-4xl"
                >
                    <div className="absolute left-[-5px] top-0 h-0 w-[1px] bg-zax-glow group-hover:h-full transition-all duration-1000 ease-in-out" />

                    <h2 className="text-3xl font-bold mb-10 flex items-center gap-4">
                        <span className="font-mono text-xs text-zax-glow tracking-[0.2em] bg-zax-glow/5 px-3 py-1.5 rounded-full border border-zax-glow/20">02. SOLUTION</span>
                        高次元ベクトルによる「本質」の抽出
                    </h2>

                    <p className="text-zax-muted leading-[2.2] mb-12 text-lg font-light tracking-wide max-w-2xl">
                        ZAXは、計算資源の飛躍的向上を前提とした<strong className="text-white font-medium">「接続OS」</strong>です。
                        あなたが発する言葉、思考の断片、そして時間とともに移ろいゆく心の変化を、
                        数千次元の<strong className="text-white font-medium">「本質ベクトル ($V_essence$)」</strong>として空間上にプロットします。
                    </p>

                    <VectorTransformationVisual />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        <div className="group/card bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all duration-500">
                            <h3 className="text-lg font-bold text-white mb-4 group-hover/card:text-zax-glow transition-colors">レゾナンス（共鳴）エンジン</h3>
                            <p className="text-sm text-zax-muted leading-loose font-light">
                                単なる条件のマッチングではなく、高次元空間においてベクトルの波長が重なり合う「共鳴」を演算します。
                            </p>
                        </div>
                        <div className="group/card bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all duration-500">
                            <h3 className="text-lg font-bold text-white mb-4 group-hover/card:text-zax-accent transition-colors">デルタベクトルの蓄積</h3>
                            <p className="text-sm text-zax-muted leading-loose font-light">
                                過去と現在の差分 (<span className="font-mono text-white/70">ΔV</span>) を解析し続けることで、その人の「変化の指向性」までを考慮した、究極の相性を導き出します。
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Macro-Economics - Vertical Logic Pipe Design */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 relative group"
                >
                    <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">
                        <span className="font-mono text-sm text-zax-accent tracking-widest bg-zax-accent/10 px-2 py-1 rounded">03. 経済効果 (IMPACT)</span>
                        孤独の経済損失とGDP
                    </h2>

                    <div className="relative pl-8 md:pl-0">
                        {/* Central Logic Pipe Line - Background */}
                        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-zax-glow to-zax-accent/50 hidden md:block" />
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-zax-glow to-zax-accent/50 md:hidden" />

                        {/* Step 1: PROBLEM (Negative) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center mb-16 relative">
                            {/* Node Point */}
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-6 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-20" />

                            <div className="md:text-right">
                                <span className="font-mono text-xs text-red-500 tracking-widest mb-2 block">公的データ (PUBLIC DATA)</span>
                                <h3 className="text-xl font-bold text-white mb-2">年間数兆円規模の損失</h3>
                                <p className="text-zax-muted text-sm leading-relaxed">
                                    孤独による医療費増大、マッチング不全による離職、<br />
                                    エンゲージメント低下は、GDPを押し下げる「負債」です。
                                </p>
                            </div>
                            <div className="hidden md:block" /> {/** Spacer for grid */}
                        </div>

                        {/* Step 2: INTERVENTION (Transformation) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center mb-16 relative">
                            {/* Node Point */}
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20" />

                            <div className="hidden md:block" /> {/** Spacer for grid */}
                            <div>
                                <div className="bg-zax-glow/10 border border-zax-glow/30 p-6 rounded-xl relative overflow-hidden backdrop-blur-md">
                                    <div className="absolute inset-0 bg-gradient-to-r from-zax-glow/5 to-transparent" />
                                    <span className="font-mono text-xs text-zax-glow tracking-widest mb-2 block relative z-10">ZAXによる介入 (INTERVENTION)</span>
                                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">摩擦を「熱量」へ変換</h3>
                                    <p className="text-zax-muted text-sm leading-relaxed relative z-10">
                                        探索コストを極小化し、ベクトル共鳴によって<br />
                                        個人の潜在能力（Human Capital）を最大化します。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: OUTCOME (Positive) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center relative mb-20">
                            {/* Node Point */}
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-6 w-2 h-2 rounded-full bg-zax-accent shadow-[0_0_10px_rgba(0,240,255,0.8)] z-20" />

                            <div className="md:text-right">
                                <span className="font-mono text-xs text-zax-accent tracking-widest mb-2 block">マクロ経済的成果 (OUTCOME)</span>
                                <h3 className="text-xl font-bold text-white mb-2">全要素生産性(TFP)の向上</h3>
                                <p className="text-zax-muted text-sm leading-relaxed">
                                    個人の幸福が最適化されることで、社会全体の生産性が向上。<br />
                                    <strong className="text-zax-accent">「幸福の最大化」こそが、最強の成長戦略です。</strong>
                                </p>
                            </div>
                            <div className="hidden md:block" /> {/** Spacer for grid */}
                        </div>

                        {/* New Graph Section to Fill Space & Provide Data */}
                        <div className="relative z-10">
                            <ImpactSimulationGraph />
                        </div>

                    </div>
                </motion.section>

                {/* Section 3: The Vision - Emotive Aesthetic */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 w-full"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-white/10 via-black to-black p-10 md:p-16 rounded-3xl border border-white/10 text-center group">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zax-glow to-transparent opacity-50" />

                        <Quote className="w-12 h-12 text-white/20 mx-auto mb-8" />

                        <h2 className="text-3xl md:text-4xl font-bold mb-8">
                            ビジョン：人類を一つの知性体へ
                        </h2>
                        <p className="text-lg text-zax-muted leading-loose mb-10 max-w-2xl mx-auto">
                            ZAXが目指すのは、単なる「友達探し」のツールではありません。<br />
                            属性というノイズを排し、魂の本質で人々が滑らかに接続されるインフラを構築すること。
                            それによって、個々の人間が孤立した点ではなく、一つの巨大な、そして温かい<strong className="text-white">「地球規模の知性体」</strong>として機能する世界を作ることです。
                        </p>
                        <p className="text-base text-white/80 font-serif italic tracking-wide">
                            「誰と出会うか」が、その人の人生の質を決定する。<br />
                            ならば、その接続を最適化することは、人類の進化そのものである。
                        </p>
                    </div>
                </motion.section>

                {/* Footer Notes: Why Now & Field - Minimalist Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10 pt-16"
                >
                    <div>
                        <h3 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-[0.2em]">Why Now? (なぜ今か)</h3>
                        <p className="text-sm text-zax-muted leading-relaxed">
                            2026年、AIの計算コストが劇的に下がり、高次元データのリアルタイム処理が個人でも可能になった今だからこそ、この「接続OS」は実現可能になりました。
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-[0.2em]">Field (実証フィールド)</h3>
                        <p className="text-sm text-zax-muted leading-relaxed">
                            まずは「武蔵野大学」という、多様性と哲学が共存するコミュニティを最初の実験場（Sandbox）とし、ここから世界へ波及させます。
                        </p>
                    </div>
                </motion.section>

                <div className="mt-32 text-center pb-20">
                    <Link href="/" className="group relative inline-flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-full font-bold transition-all hover:border-zax-glow/50">
                        <span className="text-sm tracking-widest uppercase">プロトコルを開始 (Start)</span>
                        <ArrowRight className="w-4 h-4 text-zax-glow group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zax-glow to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
