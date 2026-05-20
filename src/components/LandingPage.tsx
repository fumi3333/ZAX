"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="w-full h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative">

      {/* 背景: 2つの光 — 引き合う存在 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 左の光 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "28%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 右の光 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(244,114,182,0.14) 0%, transparent 70%)",
            top: "50%",
            left: "72%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 中心コンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* ロゴ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <span
            className="text-[88px] font-black tracking-[-6px] leading-none select-none"
            style={{ color: "#f1f1f1", letterSpacing: "-0.07em" }}
          >
            ZAX
          </span>
        </motion.div>

        {/* ひとこと */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="text-[13px] tracking-[0.25em] text-white/30 font-light uppercase"
        >
          know yourself · find your match
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <Link
            href="/diagnostic"
            className="group flex items-center gap-3 px-8 py-3.5 border border-white/15 rounded-full text-sm font-medium text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
          >
            診断を始める
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/40 group-hover:text-white transition-colors"
            >
              →
            </motion.span>
          </Link>
        </motion.div>

      </div>

    </main>
  );
}
