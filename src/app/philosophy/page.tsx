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

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0 }}
                    className="mb-24 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 border border-zax-glow/30 rounded-full bg-zax-glow/10 text-[10px] tracking-[0.2em] text-zax-glow uppercase shadow-[0_0_20px_rgba(112,0,255,0.2)]">
                        ZAX PHILOSOPHY
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8">
                        死ぬ時に「幸福だった」と<br />
                        言い切るために
                    </h1>
                </motion.div>

                {/* Section 1: My Original Experience */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-invert prose-lg text-zax-muted leading-relaxed"
                >
                    <span className="font-mono text-xs text-zax-glow/70 tracking-widest mb-4 block">01. 原体験</span>
                    <h2 className="text-2xl font-bold text-white mb-6">構造的な機会損失</h2>
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
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-zax-glow/70 tracking-widest mb-4 block">02. 幸福の最大化</span>
                    <h2 className="text-2xl font-bold text-white mb-6">潜在意識へのアクセス</h2>
                    <div className="prose prose-invert prose-lg text-zax-muted leading-relaxed mb-8">
                        <p>
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っていると私は信じています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化することを目的としたシステムです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-white/80">・潜在意識の解析：</strong> ユーザー自身も言語化できていない「心地よさ」や「価値観」をデータとして抽出します。</li>
                            <li><strong className="text-white/80">・長期目線での最適化：</strong> 一過性の盛り上がりではなく、人生単位で互いを高め合える「共鳴」を演算します。</li>
                        </ul>
                        <p className="mt-6">
                            このシステムの目的関数は、単なるマッチングの成立ではなく、「ユーザー個人の長期的な幸福量（<span className="font-serif italic font-bold text-white">H<sub>long-term</sub></span>）の最大化」であると考えています。
                        </p>
                    </div>

                    {/* Math Visual */}
                    <div className="flex justify-center my-12">
                        <div className="bg-black/40 border border-white/10 px-8 py-6 rounded-xl backdrop-blur-sm">
                            <span className="font-serif text-2xl md:text-3xl text-zax-glow italic tracking-wider">
                                Maximize <span className="mx-2 text-white">∑</span> H<sub className="text-sm">t</sub>(V<sub className="text-sm">subconscious</sub>)
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Chain of Thought */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-invert prose-lg text-zax-muted leading-relaxed"
                >
                    <span className="font-mono text-xs text-zax-glow/70 tracking-widest mb-4 block">03. 納得の共有</span>
                    <h2 className="text-2xl font-bold text-white mb-6">Chain of Thought</h2>
                    <p>
                        また、ZAXにおいては「なぜこの人と響き合うのか」というプロセスも大切にしたいと考えています。
                        AIがユーザーの潜在意識をどう解釈したのか、その思考の推論プロセス（Chain of Thought）を共有することで、ユーザーは自分自身の新しい一面に気づくことができます。
                    </p>
                    <div className="border-l-2 border-zax-glow/30 pl-6 my-6 italic text-white/70">
                        「このCoTが生み出す『納得感』こそが、属性の壁を超えて深く繋がるための土台になると確信しています。」
                    </div>
                </motion.section>

                {/* Section 4: Innovation as Byproduct */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-zax-glow/70 tracking-widest mb-4 block">04. 副産物としてのイノベーション</span>
                    <h2 className="text-2xl font-bold text-white mb-6">個人の幸福が社会を変える</h2>
                    <div className="prose prose-invert prose-lg text-zax-muted leading-relaxed mb-8">
                        <p>
                            個々人が自分にとって最適な場所、最適なパートナー、そして真の自己に繋がることができたとき、その社会は勝手に良くなっていくはずです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-white/80">・イノベーションの加速：</strong> 魂のレベルで共鳴する個体が繋がることで、これまでにない創造的な火花が散ります。</li>
                            <li><strong className="text-white/80">・経済への正の影響：</strong> 孤独による停滞やミスマッチによる損失が消え、個々の知性が最大出力で駆動するようになります。</li>
                        </ul>
                        <p className="mt-6">
                            こうした社会の発展やイノベーションは、あくまで<strong className="text-white">「個人の幸福を追求した結果」</strong>として現れる副産物に過ぎないというのが私の考えです。
                            ZAXが何よりも優先するのは、あなたという個人が、あなたの人生を肯定できる「接続」を提供することです。
                        </p>
                    </div>

                    {/* Chart as "Evidence of Byproduct" */}
                    <div className="mt-8 h-[400px] md:h-[500px] w-full">
                        <ImpactChart />
                    </div>
                </motion.section>

                {/* Section 5: Future with BMI */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 prose prose-invert prose-lg text-zax-muted leading-relaxed"
                >
                    <span className="font-mono text-xs text-zax-glow/70 tracking-widest mb-4 block">05. 未来へ</span>
                    <h2 className="text-2xl font-bold text-white mb-6">BMIが普及した世界に向けて</h2>
                    <p>
                        今はまだスマートフォンを通じたインターフェースですが、このZAXという構想は、将来的にBMI（脳マシンインタフェース）が普及した世の中で、さらに真価を発揮できると確信しています。
                    </p>
                    <p>
                        言葉や属性といったフィルターを完全に脱ぎ捨て、心と心が直接響き合う。
                        そんな、誰もが自分の人生を幸福だと思える未来を、私は作っていきたいと考えています。
                    </p>
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
