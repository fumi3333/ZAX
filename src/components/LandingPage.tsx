"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import HeroVisual from "@/components/HeroVisual";

interface LandingPageProps {
  onEnter: () => void;
}

const topics = [
  {
    label: "RESEARCH BACKGROUND",
    title: "人類の孤独に対する構造的な解",
    desc: "プロフィールやステータスではなく、個人の深層にある「価値観」を数学的に解析し、言葉を超えた直感的な共鳴を再現します。",
    href: "/about",
  },
  {
    label: "6-DIMENSION VECTOR",
    title: "AIが描く、思考の幾何学",
    desc: "論理、直感、共感... 6つの指標を抽出し、他者との相性を「距離」として計算。純粋な数学的アプローチです。",
    href: "/technology",
  },
  {
    label: "CHAIN OF THOUGHT",
    title: "「なぜ」を語る透明な推論",
    desc: "マッチングの理由をブラックボックスにしません。AIが論理的に説明し、初対面の相手とも深い対話を可能にします。",
    href: "/philosophy",
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <main className="w-full bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-50/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-slate-100/60 rounded-full blur-[100px]" />
        </div>

        {/* Hero Visual - subtle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-full max-w-4xl aspect-square">
            <HeroVisual />
          </div>
        </div>

        {/* Hero Content - CyberAgent style: clean, minimal */}
        <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 mb-8 rounded-full bg-slate-100 text-slate-600 text-xs font-medium tracking-wider"
          >
            VALUE-BASED CONNECTION
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-7xl md:text-8xl font-bold tracking-tight mb-8 text-slate-900"
          >
            ZAX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl text-slate-600 mb-6 leading-relaxed max-w-2xl"
          >
            価値観でつながる、
            <br />
            <span className="font-bold text-slate-900">新しい知性体コミュニケーション</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm text-slate-500 mb-12 max-w-lg"
          >
            表面的なプロフィールではなく、あなたの「本質」から共鳴する相手を見つけ出します。
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={onEnter}
            className="group inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white text-base font-bold rounded-full hover:bg-slate-800 transition-colors"
          >
            <span>診断を開始</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-12 flex flex-col items-center gap-2 text-slate-400"
          >
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <div className="w-px h-10 bg-slate-300" />
          </motion.div>
        </div>
      </section>

      {/* --- TOPICS SECTION (CyberAgent style card grid) --- */}
      <section className="w-full py-24 lg:py-32 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-sm font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">
              Topics
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              トピックス
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  href={topic.href}
                  className="group block h-full bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                  <span className="text-xs font-bold text-slate-400 tracking-wider block mb-4">
                    {String(i + 1).padStart(2, "0")} / {topic.label}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {topic.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    詳しく見る
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              href="/about"
              className="inline-block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              企業情報・哲学を見る →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE SECTION --- */}
      <section className="w-full py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-[0.2em] block mb-4">
                01 / CORE TECHNOLOGY
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                AIが描く、<br />
                6次元のベクトル空間
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                論理、直感、共感、構造化能力...。ZAXのアルゴリズムは、
                あなたの発話や行動パターンから6つの指標を抽出し、
                他者との相性を「距離」として計算します。
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
              >
                技術詳細を見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-80 lg:h-96 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-40 p-8">
                <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="50" stroke="#8b5cf6" strokeWidth="1" fill="none" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.5" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.5" />
                <circle cx="140" cy="70" r="3" fill="#3b82f6" />
                <circle cx="60" cy="130" r="3" fill="#8b5cf6" />
              </svg>
              <div className="absolute bottom-4 right-4 text-[10px] text-white/60 font-mono">
                FIG.1 VECTOR SPACE
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-32 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative h-80 lg:h-96 bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 flex flex-col justify-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
              <span className="text-xs font-bold text-slate-500 mb-2">AI REASONING LOG</span>
              <p className="text-sm text-slate-600 font-mono leading-relaxed">
                "User A relies on logical structure (Logic: 8.5), while User B excels in intuitive leaps...
                Their conversation vectors intersect at [Subject: Future Vision], creating a high-potential resonance field."
              </p>
            </motion.div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold text-slate-400 tracking-[0.2em] block mb-4">
                02 / CHAIN OF THOUGHT
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                「なぜ」を語る、<br />
                透明な推論
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                マッチングの理由をブラックボックスにしません。
                「この人と話すべき理由」を、AIが論理的に説明します。
                共通の価値観、補完しあえる思考の癖。その根拠を知ることで、
                初対面の相手とも深い対話が可能になります。
              </p>
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors"
              >
                診断を開始
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="w-full py-24 lg:py-32 bg-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
            あなたの本質を、可視化する。
          </h3>
          <p className="text-slate-300 mb-10 max-w-xl mx-auto">
            ZAXは、属性ではなく価値観でつながる新しいマッチングプロトコルです。
          </p>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-3 px-12 py-5 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            診断を開始
          </button>
        </motion.div>
      </section>
    </main>
  );
}
