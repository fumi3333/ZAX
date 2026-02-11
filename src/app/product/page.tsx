"use client";

import { motion } from "framer-motion";
import { Brain, Network, GitMerge, RefreshCw, MousePointer2, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ThreeLayerModel from "@/components/product/ThreeLayerModel";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
         <div className="font-black text-xl tracking-tight text-white">ZAX / PROTOCOL</div>
         <Link href="/" className="text-xs font-mono font-bold hover:text-indigo-400 transition-colors">BACK TO TOP</Link>
      </header>

      {/* 縦スクロールレイアウト — 各カードをフルワイドで縦積み */}
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col gap-8 md:gap-12">

        {/* ───────────────────────────────────────────── */}
        {/* [A] TITLE CARD — ヒーロー */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[60vh] bg-slate-900/50 border border-white/5 rounded-[32px] p-12 md:p-16 relative overflow-hidden group flex flex-col justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 背景グロー */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold tracking-widest text-indigo-300 border border-white/5">LOGIC v2.0</span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
                    The Logic<br/><span className="text-indigo-500">of Resonance.</span>
                </h1>
                <p className="text-slate-400 font-medium text-lg md:text-xl max-w-lg leading-relaxed">
                    直感的な「運命」の裏側にある、<br/>
                    あなたのための緻密な計算式。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [B] PARADIGM — Frozen to Fluid */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-between items-start mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">01</span>
                <Brain className="text-indigo-500 w-12 h-12" />
            </div>
            <div className="max-w-xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Frozen to Fluid</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                    静的属性（過去）ではなく、動的意志（未来）を計算。<br/>
                    <span className="text-indigo-400">常に変化するあなた</span>を捉え続ける。
                    従来のマッチングは、年齢・職業・趣味といった「固定された属性」でフィルタリングします。
                    しかしZAXは、あなたの「今この瞬間の思考の方向性」をベクトル化し、
                    リアルタイムに更新される動的なプロフィールで共鳴する相手を見つけます。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [C] MECHANISM — Evolutionary Loop */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-indigo-600 text-white rounded-[32px] p-12 md:p-16 flex flex-col justify-between relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
             {/* 回転アニメーション背景 */}
             <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ originX: 0.5, originY: 0.5 }}
             >
                <div className="absolute inset-20 border border-white/10 rounded-full border-dashed" />
                <div className="absolute inset-32 border border-white/5 rounded-full border-dashed" />
             </motion.div>
             
             <div className="relative z-10">
                <RefreshCw className="mb-8 opacity-80 w-12 h-12" />
                <h3 className="text-5xl md:text-6xl font-bold leading-[0.9] mb-4">Evolutionary<br/>Loop</h3>
                <div className="text-sm opacity-70 mt-4 font-mono uppercase tracking-widest">Interaction → Update → Evolve</div>
             </div>
             
             <div className="relative z-10 mt-12 max-w-xl">
                <p className="text-white/80 text-lg leading-relaxed">
                    ZAXは一度マッチして終わりではありません。
                    対話するたびにあなたのベクトルは更新され、
                    より精度の高い共鳴相手が見つかるようになります。
                    使えば使うほど、あなた自身の「本質」も可視化されていく — 
                    これがEvolutionary Loopです。
                </p>
             </div>

             <ArrowUpRight className="absolute bottom-12 right-12 text-white/30 w-16 h-16" />
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [D] 3-LAYER MODEL — アーキテクチャ */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[70vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 上部グラデーションライン */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-blue-500" />
            
            <div className="mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800">02</span>
                <h3 className="text-4xl md:text-5xl font-bold text-white mt-4">3-Layer Architecture</h3>
                <p className="text-slate-400 text-lg mt-4 max-w-lg">
                    不動の基盤（CORE）と、瞬時に変わる適応層（LAYER 3）。<br/>
                    3層構造により、安定性と柔軟性を両立しています。
                </p>
            </div>

            {/* 3層モデルビジュアル — 中央揃えで大きく表示 */}
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="w-full max-w-md">
                    <ThreeLayerModel />
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [E] SWARM INTELLIGENCE — 集合知能 */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-white text-slate-900 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-shadow"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div>
                 <div className="flex items-center gap-3 mb-6">
                    <GitMerge className="text-indigo-600 w-8 h-8" />
                    <span className="font-mono font-bold text-sm text-slate-400 tracking-widest">03 COLLECTIVE</span>
                 </div>
                 <h3 className="text-5xl md:text-6xl font-black mb-8">Swarm Intelligence</h3>
                 <p className="text-slate-600 font-medium text-lg md:text-xl leading-relaxed max-w-2xl">
                     個々のモデルは孤立せず、成功体験を共有。<br/>
                     人類全体の幸福の最適解を探索する分散型知能。<br/><br/>
                     あるペアの対話から得られた「共鳴パターン」は、
                     匿名化された上で全体のマッチングアルゴリズムにフィードバックされます。
                     これにより、ユーザーが増えるほど精度が向上する集合知能を実現しています。
                 </p>
            </div>
            
            {/* ノード接続ビジュアル */}
            <div className="mt-12 w-full h-32 bg-slate-50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex -space-x-4">
                        {[...Array(8)].map((_,i) => (
                            <motion.div 
                                key={i} 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 border-3 border-white"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [F] ROADMAP — Phase 1 Launch */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[40vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <MousePointer2 className="mb-8 text-emerald-500 group-hover:scale-125 transition-transform duration-500" size={48} />
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Phase 1 Launch</h3>
            <div className="text-emerald-400 font-bold font-mono text-2xl">2026.04</div>
            <div className="text-slate-500 text-lg mt-4">Musashino University</div>
            <p className="text-slate-500 mt-6 max-w-md">
                武蔵野大学を皮切りに、学生同士の「本質的なつながり」を創出するプロトタイプを展開します。
            </p>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* CTA */}
        {/* ───────────────────────────────────────────── */}
        <div className="mt-12 text-center">
            <Link 
                href="/" 
                className="inline-flex items-center gap-4 px-16 py-8 bg-white text-slate-950 rounded-full font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
                START PROTOTYPE
                <ArrowRight size={28} />
            </Link>
        </div>

      </div>
    </div>
  );
}
