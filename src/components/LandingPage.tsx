"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Users, TrendingUp, Sparkles } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    label: "本質分析",
    title: "思考の6次元を可視化",
    desc: "思考特性を6次元ベクトルとして分析し、あなたの内面を可視化。属性ではなく、本質から相手を見つけます。",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    label: "共鳴マッチング",
    title: "ベクトル空間で出会う",
    desc: "高次元の空間計算により、自分でも気づかない「共通点」を持つ相手を見つけ、AIが論理的に相性を説明します。",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: TrendingUp,
    label: "成長記録",
    title: "対話で進化する自分",
    desc: "対話を通じた自己の変化を記録し、新たな価値観への気づきを促します。あなたのベクトルは出会いごとに更新されます。",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function LandingPage() {
  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans">
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-10 rounded-full bg-white text-slate-500 text-xs font-medium tracking-wider border border-slate-200/60 shadow-sm"
          >
            VALUE-BASED CONNECTION
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-6"
          >
            ZAX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed mb-4 max-w-xl"
          >
            価値観でつながる、
            <span className="font-semibold text-slate-900"> 新しい知性体コミュニケーション</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-sm text-slate-500 mb-12 max-w-md"
          >
            50の質問から、あなたの「本質」を可視化します。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/diagnostic"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              無料で診断を開始
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              詳しく見る
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section id="features" className="w-full py-28 lg:py-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="text-sm font-semibold text-slate-400 tracking-[0.15em] uppercase mb-3">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              ZAXの3つの機能
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider mb-2">{f.label}</p>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROP ─── */}
      <section className="w-full py-28 lg:py-40 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-[0.15em] block mb-3">TECHNOLOGY</span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                AIが描く、<br />6次元のベクトル空間
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                論理、直感、共感... ZAXのアルゴリズムは、あなたの発話や行動から6つの指標を抽出し、
                他者との相性を「距離」として計算します。
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                プロダクト・アーキテクチャを見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="h-72 lg:h-80 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 p-10">
                <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="50" stroke="#8b5cf6" strokeWidth="1" fill="none" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="0.5" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                <circle cx="140" cy="70" r="4" fill="#3b82f6" />
                <circle cx="60" cy="130" r="4" fill="#8b5cf6" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="w-full py-28 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 lg:p-20">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              あなたの本質を、可視化する。
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              属性ではなく価値観でつながる、新しいマッチングプロトコル。
            </p>
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              無料で診断を開始
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
