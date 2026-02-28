"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
            人とのつながりをサポートし、
            <span className="font-semibold text-slate-900"> 自分の変化を可視化する</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-sm text-slate-500 mb-12 max-w-md"
          >
            あなたのブラウザの履歴から、価値観とつながり方を可視化します。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/history"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              無料で履歴解析を開始
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
    </main>
  );
}
