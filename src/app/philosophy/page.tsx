"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import VectorTransformationVisual from "@/components/VectorTransformationVisual";
import ImpactChart from "@/components/ImpactChart"; // New Chart
import VectorClusterVisual from "@/components/VectorClusterVisual"; // New Visual
import ImpactSimulationGraph from "@/components/ImpactSimulationGraph";
import CountUp from "@/components/CountUp";

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

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24">
                {/* Header - Editorial Style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <div className="text-center md:text-left">
                        <div className="inline-block px-4 py-1.5 mb-6 border border-zax-glow/30 rounded-full bg-zax-glow/10 text-[10px] tracking-[0.2em] text-zax-glow uppercase shadow-[0_0_20px_rgba(112,0,255,0.2)]">
                            ZAX POLICY & PHILOSOPHY
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                            人類を、<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zax-glow via-white to-zax-accent">
                                一つの知性体へ。
                            </span>
                        </h1>
                    </div>
                    <div>
                        <p className="text-lg text-zax-muted leading-relaxed border-l-2 border-white/10 pl-6 ml-0 md:ml-6">
                            属性の壁を壊し、魂の本質で接続する。<br />
                            これは、孤独な「点」を、温かい「線」へと変える試みです。<br /><br />
                            <span className="text-xs text-white/50 block mt-4">
                                ZAX connects people not by their labels, but by their essence vectors. A challenge to transform isolated dots into warm, connecting lines.
                            </span>
                        </p>
                    </div>
                </motion.div>

                {/* Section 1: The Bug - Glitch Aesthetic */}
                {/* Section 1: The Bug - Glitch Aesthetic */}
                {/* Section 1: The Bug - Glitch Aesthetic */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 pt-16 relative"
                >
                    {/* Glass Background for Section 1 */}
                    <div className="absolute inset-x-[-20px] inset-y-[-20px] bg-white/[0.02] rounded-3xl -z-10 backdrop-blur-sm" />

                    <div className="md:col-span-5 prose prose-invert prose-lg text-zax-muted leading-relaxed pt-8 pl-8">
                        <span className="font-mono text-xs text-red-500 tracking-widest mb-4 block">01. 現状の課題</span>
                        <h2 className="text-3xl font-bold text-white mb-6">既存社会の「属性」バグ</h2>
                        <p className="mb-4 text-base">
                            現在の社会は「大学名」「年収」「外見」といった<strong className="text-white">記号化された属性 (Attributes)</strong>によって支配されています。
                        </p>
                        <p className="text-base">
                            しかし、これら低次元なデータに基づくマッチングは、私たちの本質的な孤独を癒やすどころか、むしろ「条件による分断」を加速させる<span className="text-red-400">社会システムの脆弱性</span>です。
                        </p>
                    </div>
                    <div className="md:col-span-7 flex items-center justify-center bg-black/40 rounded-xl min-h-[300px] relative overflow-hidden group m-4">
                        {/* Abstract Visual for "Bug" / "Noise" */}
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay group-hover:opacity-40 transition-opacity" />
                        <div className="text-center relative z-10 p-8">
                            <div className="text-4xl font-bold text-white/10 tracking-tighter mb-2 blur-[2px]">MISMATCH</div>
                            <div className="text-red-500/50 font-mono text-sm">接続エラー: 属性の壁</div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: The Solution - Technology Aesthetic */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 pt-16 relative"
                >
                    {/* Glass Background for Section 2 */}
                    <div className="absolute inset-x-[-20px] inset-y-[-20px] bg-zax-glow/[0.02] rounded-3xl -z-10 backdrop-blur-sm" />

                    <div className="md:col-span-7 order-2 md:order-1 relative m-4">
                        {/* Interactive Visual */}
                        <VectorClusterVisual />
                        <div className="absolute -bottom-6 -right-6 w-48 text-[10px] text-zax-muted text-right font-mono opacity-50">
                            * 6次元ベクトル空間 プロトタイプ
                        </div>
                    </div>
                    <div className="md:col-span-5 order-1 md:order-2 prose prose-invert prose-lg text-zax-muted leading-relaxed pt-8 pr-8">
                        <span className="font-mono text-xs text-zax-glow tracking-widest mb-4 block">02. 解決策</span>
                        <h2 className="text-3xl font-bold text-white mb-6">高次元ベクトルによる抽出</h2>
                        <p className="mb-4 text-base">
                            ZAXは、人間の思考や感性を数千次元の<strong className="text-white">「本質ベクトル」</strong>として空間上にプロットする「接続OS」です。
                        </p>
                        <p className="text-base">
                            表面的な条件ではなく、ベクトルの波長が重なり合う「共鳴（Resonance）」を解析し、魂レベルでのマッチングを実現します。
                        </p>
                        <div className="mt-6 flex gap-4">
                            <div className="px-3 py-1 bg-zax-glow/10 border-none rounded text-xs text-zax-glow">
                                AI推論エンジン
                            </div>
                            <div className="px-3 py-1 bg-white/5 border-none rounded text-xs text-white/50">
                                Embedding-001
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Impact (Grid Layout with Chart) */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 pt-16"
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div className="md:col-span-4">
                            <span className="font-mono text-xs text-zax-accent tracking-widest mb-4 block">03. 経済的インパクト</span>
                            <h2 className="text-3xl font-bold mb-6">構造的欠落 (Void) の<br />経済的解放</h2>
                            <p className="text-zax-muted text-sm leading-relaxed mb-8">
                                孤独・孤立は単なる心理的課題ではなく、医療費増大や労働生産性の低下を招く「見えない税金」です。
                                ZAXは、この<strong className="text-white">「社会関係資本のミスマッチ」</strong>を解消し、横浜市立大学等の推計による<span className="text-zax-glow">約7.6兆円の経済損失（プレゼンティズム）</span>の回復を目指します。
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="text-xs text-white/50 mb-1">Target Metric</div>
                                    <div className="text-xl font-bold text-white">メンタルヘルス不調・損失</div>
                                    <div className="text-xs text-red-400 mt-1">構造的なGDP抑制要因 (1.1%)</div>
                                </div>
                                <div className="p-4 bg-zax-glow/10 rounded">
                                    <div className="text-xs text-zax-glow mb-1">Projected Unlock</div>
                                    <div className="text-xl font-bold text-white">7.6 兆円 / 年</div>
                                    <div className="text-xs text-zax-glow mt-1">プレゼンティズム解消効果</div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-8 h-full min-h-[400px]">
                            <ImpactChart />
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8"
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

                <div className="mt-20 text-center pb-20">
                    <Link href="/" className="group relative inline-flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-full font-bold transition-all hover:border-zax-glow/50">
                        <span className="text-sm tracking-widest uppercase">プロトコルを開始 (Start)</span>
                        <ArrowRight className="w-4 h-4 text-zax-glow group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zax-glow to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </div >
        </div >
    );
}
