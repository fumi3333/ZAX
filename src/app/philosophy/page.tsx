import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import VectorTransformationVisual from "@/components/VectorTransformationVisual";
import ImpactSimulationGraph from "@/components/ImpactSimulationGraph";

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-[#08080C] text-white selection:bg-zax-glow/30 selection:text-zax-glow font-sans pb-40 overflow-x-hidden">
            {/* ... Ambient Background ... */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[180px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-slate-900/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A10]/50 to-[#08080C]" />
            </div>

            {/* Navigation removed - moved to Global Layout */}

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-48">
                {/* ... Header ... */}
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
                        <motion.div whileHover={{ y: -5 }}>
                            <Card className="hover:border-zax-glow/40 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle>レゾナンス（共鳴）エンジン</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm leading-loose">
                                        単なる条件のマッチングではなく、高次元空間においてベクトルの波長が重なり合う「共鳴」を演算します。
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }}>
                            <Card className="hover:border-zax-accent/40 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle>デルタベクトルの蓄積</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm leading-loose">
                                        過去と現在の差分 (<span className="font-mono text-white/70">ΔV</span>) を解析し続けることで、その人の「変化の指向性」までを考慮した、究極の相性を導き出します。
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Section 3: Macro-Economics - Vertical Logic Pipe Design */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 0.8 }}
                    className="min-h-screen flex flex-col justify-center mb-0 relative group" // Full screen section
                >
                    <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:hidden" />

                    <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
                        <span className="block text-sm font-mono text-zax-accent tracking-[0.3em] mb-4">03. IMPACT</span>
                        孤独の経済損失とGDP
                    </h2>

                    <div className="relative pl-8 md:pl-0 space-y-24">

                        {/* Step 1: PROBLEM (Negative) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center relative">
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-20" />

                            <div className="md:text-right md:pr-12">
                                <motion.div whileHover={{ scale: 1.02 }}>
                                    <Card className="inline-block bg-red-500/5 border-red-500/20 text-left md:text-right w-full">
                                        <CardHeader>
                                            <span className="font-mono text-xs text-red-500 tracking-widest mb-1 block">PUBLIC DATA</span>
                                            <CardTitle className="text-2xl font-bold text-white">
                                                年間 <CountUp end={6.7} suffix="兆円" duration={2.5} className="text-4xl text-red-500 mx-1" /> の損失
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-zax-muted text-sm leading-loose">
                                                孤独による医療費増大、離職、エンゲージメント低下。<br />
                                                これらは個人の問題ではなく、GDPを押し下げる「巨大な負債」です。
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                            <div className="hidden md:block" />
                        </div>

                        {/* Step 2: INTERVENTION (Transformation) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center relative">
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20" />

                            <div className="hidden md:block" />
                            <div className="md:pl-12">
                                <motion.div whileHover={{ scale: 1.02 }}>
                                    <Card className="bg-zax-glow/5 border-zax-glow/20 relative overflow-hidden backdrop-blur-md">
                                        <div className="absolute inset-0 bg-gradient-to-r from-zax-glow/10 to-transparent opacity-50 pointer-events-none" />
                                        <CardHeader className="relative z-10">
                                            <span className="font-mono text-xs text-zax-glow tracking-widest mb-1 block">ZAX INTERVENTION</span>
                                            <CardTitle className="text-2xl font-bold text-white">摩擦を「熱量」へ変換</CardTitle>
                                        </CardHeader>
                                        <CardContent className="relative z-10">
                                            <CardDescription className="text-zax-muted text-sm leading-loose">
                                                探索コストを極小化し、ベクトル共鳴によって<br />
                                                個人の潜在能力（Human Capital）を最大化します。
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>

                        {/* Step 3: OUTCOME (Positive) */}
                        <div className="md:grid md:grid-cols-2 gap-12 items-center relative">
                            <div className="absolute left-[-4px] md:left-1/2 md:-ml-1 top-1/2 w-2 h-2 rounded-full bg-zax-accent shadow-[0_0_10px_rgba(0,240,255,0.8)] z-20" />

                            <div className="md:text-right md:pr-12">
                                <motion.div whileHover={{ scale: 1.02 }}>
                                    <Card className="inline-block bg-zax-accent/5 border-zax-accent/20 text-left md:text-right w-full">
                                        <CardHeader>
                                            <span className="font-mono text-xs text-zax-accent tracking-widest mb-1 block">OUTCOME</span>
                                            <CardTitle className=" text-2xl font-bold text-white">全要素生産性(TFP)の向上</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-zax-muted text-sm leading-loose">
                                                幸福の最大化こそが、最強の成長戦略。<br />
                                                <strong className="text-zax-accent">GDP +3.2%</strong> のインパクトを予測。
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                            <div className="hidden md:block" />
                        </div>

                        {/* Graph Section */}
                        <div className="relative z-10 pt-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Card className="border-zax-accent/20 bg-black/60 overflow-hidden">
                                    <CardContent className="p-0">
                                        <ImpactSimulationGraph />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
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
            </div >
        </div >
    );
}
