"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Sparkles, Users, TrendingUp } from "lucide-react";
import HeroVisual from "@/components/HeroVisual";
import EssenceVisualizer from "@/components/EssenceVisualizer";

interface LandingPageProps {
  onEnter: () => void;
}

const featureCards = [
  {
    icon: BrainCircuit,
    label: "本質分析",
    title: "思考の6次元を可視化",
    desc: "思考特性を6次元ベクトルとして分析し、あなたの内面を可視化します。属性ではなく、本質から相手を見つけます。",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    label: "共鳴マッチング",
    title: "ベクトル空間で出会う",
    desc: "1000次元の空間計算により、自分でも気づかない「共通点」を持つ相手を見つけます。AIが論理的に相性を説明します。",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: TrendingUp,
    label: "成長記録",
    title: "対話で進化する自分",
    desc: "対話を通じた自己の変化を記録し、新たな価値観への気づきを促します。あなたのベクトルは、出会いごとに更新されます。",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
        {/* Blur Blobs Removed for Brutalist Clarity */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">...</div> */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <div className="w-full max-w-4xl aspect-square">
            <HeroVisual />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-6 py-3 mb-12 bg-slate-900 text-white text-sm font-bold tracking-[0.3em] uppercase border-2 border-white/20"
          >
            VALUE-BASED CONNECTION
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="text-[13vw] leading-[0.8] font-black tracking-tighter mb-6 text-slate-900 mix-blend-difference opacity-90"
          >
            ZAX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="text-xl md:text-2xl text-slate-600 mb-5 leading-relaxed max-w-2xl"
          >
            価値観でつながる、
            <span className="font-bold text-slate-900"> 新しい知性体コミュニケーション</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="text-sm text-slate-500 mb-12 max-w-lg"
          >
            表面的なプロフィールではなく、あなたの「本質」から共鳴する相手を見つけ出します。
          </motion.p>

          {/* Massive CTA Button (Reactor Core -> Precision Instrument) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-32 relative group"
          >
            <div className="relative">
              <button
                onClick={onEnter}
                className="relative overflow-hidden w-full md:w-auto min-w-[300px] px-8 py-5 md:px-12 md:py-6 bg-slate-900 text-white text-base md:text-lg font-bold tracking-[0.2em] rounded-full transition-all duration-300 shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 flex items-center justify-center gap-6 border border-white/10 group"
              >
                {/* Button Shine Effect Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                <span className="relative z-10 flex items-center gap-4">
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-4">▶</span>
                  <span>診断を開始</span>
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Decorative Tech Lines (Attached to button) */}
              <div className="absolute top-1/2 left-[-20px] w-[10px] h-[1px] bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-1/2 right-[-20px] w-[10px] h-[1px] bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-16 flex flex-col items-center gap-2 text-slate-400"
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE CARDS: Bento Grid Layout (Iteration 4) --- */}
      <section id="features" className="w-full py-32 lg:py-44 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-sm font-bold text-slate-500 tracking-[0.2em] uppercase mb-4">
              CORE ARCHITECTURE
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              System Modules
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Essence Analysis (Large) */}
            <div className="md:col-span-2 md:row-span-1 bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-blue-900" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 mb-2 block">MODULE 01</span>
                  <h4 className="text-3xl font-bold text-slate-900 mb-4">Essence Parsing</h4>
                  <p className="text-slate-600 max-w-md">自然言語処理と行動分析により、あなたの思考特性を6次元ベクトル空間にマッピングします。</p>
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-transparent mt-8" />
              </div>
            </div>

            {/* Card 2: Resonance (Tall) */}
            <div className="md:col-span-1 md:row-span-2 bg-slate-900 text-white rounded-3xl p-10 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500 mb-2 block">MODULE 02</span>
                  <h4 className="text-3xl font-bold text-white mb-4">Resonance Engine</h4>
                  <p className="text-slate-400">1000次元のベクトル演算により、自己紹介では見えない「本質的共鳴」を検出。</p>
                </div>
                <div className="mt-auto pt-10">
                   <Users className="w-16 h-16 text-white/20 group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
            </div>

            {/* Card 3: Feedback (Standard) */}
            <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col justify-between group">
              <div>
                 <span className="text-xs font-mono text-slate-400 mb-2 block">MODULE 03</span>
                 <h4 className="text-2xl font-bold text-slate-900 mb-2">Evolution Log</h4>
                 <p className="text-sm text-slate-600">対話による自己変容を記録。</p>
              </div>
              <TrendingUp className="w-10 h-10 text-slate-900" />
            </div>

            {/* Card 4: Tech Spec (Standard) */}
            <div className="md:col-span-1 md:row-span-1 bg-blue-50/50 rounded-3xl p-10 border border-blue-100 flex flex-col justify-center items-center text-center group hover:bg-blue-100 transition-colors">
              <span className="text-4xl font-black text-blue-600 mb-2">98.4%</span>
              <span className="text-sm font-bold text-blue-900 uppercase tracking-widest">Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUE PROPOSITION --- */}
      <section className="w-full py-32 lg:py-44">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-[0.2em] block mb-4">
                01 / TECHNOLOGY
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                AIが描く、<br />6次元のベクトル空間
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                論理、直感、共感... ZAXのアルゴリズムは、あなたの発話や行動から6つの指標を抽出し、
                他者との相性を「距離」として計算します。
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-900 text-slate-900 font-semibold hover:bg-slate-900 hover:text-white transition-all duration-200"
              >
                技術詳細
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-80 lg:h-96 bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden flex items-center justify-center"
            >
              <div className="w-full h-full flex items-center justify-center">
                 <EssenceVisualizer interactive={true} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="w-full py-32 lg:py-44">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-16 lg:p-24">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              あなたの本質を、可視化する。
            </h3>
            <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
              ZAXは、属性ではなく価値観でつながる新しいマッチングプロトコルです。
            </p>
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-slate-900/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              無料で診断を開始
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
