"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeedbackLoopDiagram from "./FeedbackLoopDiagram";

export default function LandingPage() {
  return (
    <main className="w-full h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col items-center justify-center">
      {/* ─── HERO ─── */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
        >
          ZAX
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="text-base md:text-xl text-slate-600 leading-relaxed mb-4 max-w-2xl"
        >
          対話とフィードバックを繰り返し、精度を高め
          <br />
          <span className="font-bold text-slate-900">本当に波長の合う相手と繋がる</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="w-full mb-6"
        >
          <FeedbackLoopDiagram />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/diagnostic"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            無料で診断を開始
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
