"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Sparkles, Users, TrendingUp } from "lucide-react";
import HeroVisual from "@/components/HeroVisual";

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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-violet-100/40 rounded-full blur-[100px]" />
        </div>
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
            className="inline-block px-4 py-2 mb-8 rounded-full bg-white/90 text-slate-600 text-xs font-semibold tracking-wider shadow-sm border border-slate-200/60"
          >
            VALUE-BASED CONNECTION
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-slate-900"
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

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            onClick={onEnter}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-base font-semibold rounded-xl hover:shadow-xl hover:shadow-slate-900/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>無料で診断を開始</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

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

      {/* --- FEATURE CARDS: 本質分析・共鳴マッチング・成長記録 --- */}
      <section id="features" className="w-full py-32 lg:py-44">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 lg:mb-28"
          >
            <h2 className="text-sm font-semibold text-slate-400 tracking-[0.2em] uppercase mb-4">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              ZAXの3つの機能
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {featureCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-8 lg:p-10 shadow-lg shadow-slate-200/60 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/80 hover:border-slate-200/80 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl ${card.bgLight} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
                    <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 tracking-wider block mb-3">
                    {card.label}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">
                    {card.title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[15px]">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
            >
              今すぐ体験する
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
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
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 p-10">
                <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="50" stroke="#8b5cf6" strokeWidth="1" fill="none" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#94a3b8" strokeWidth="0.5" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="140" cy="70" r="4" fill="#3b82f6" />
                <circle cx="60" cy="130" r="4" fill="#8b5cf6" />
              </svg>
              <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-mono">
                FIG.1 VECTOR SPACE
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
