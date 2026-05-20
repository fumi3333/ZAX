"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="w-full h-screen bg-white text-slate-900 flex flex-col overflow-hidden">

      {/* ── ヘッダー ── */}
      <header className="px-8 pt-7 flex items-center justify-between shrink-0">
        <span className="text-sm font-black tracking-[0.15em] uppercase">ZAX</span>
        <span className="text-[11px] text-slate-400 tracking-widest uppercase">武蔵野大学</span>
      </header>

      {/* ── メインコンテンツ ── */}
      <div className="flex-1 grid grid-cols-2">

        {/* 左: ビジュアル */}
        <div className="flex items-center justify-center border-r border-slate-100 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* 2つの円 = 2人の出会い */}
            <div className="relative w-52 h-52">
              <motion.div
                className="absolute w-36 h-36 rounded-full border-2 border-slate-900"
                style={{ top: "10%", left: "0%" }}
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-36 h-36 rounded-full border-2 border-slate-900 bg-slate-900"
                style={{ top: "10%", right: "0%" }}
                animate={{ x: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* 交差ゾーンのラベル */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 tracking-widest uppercase whitespace-nowrap"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                complementary
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* 右: テキスト */}
        <div className="flex flex-col justify-center px-14 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-[11px] text-slate-400 tracking-[0.2em] uppercase">
              60問の価値観診断
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
              自分を知り、<br />
              引き合う人と<br />
              出会う。
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              AIがあなたの本質を分析し、<br />
              価値観が補完し合える相手を見つける。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 w-fit px-7 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-700 transition-all"
            >
              無料で診断を始める
              <span className="text-slate-400">→</span>
            </Link>
            <p className="text-[11px] text-slate-400 tracking-wide">
              登録不要 · 匿名 · 5〜7分
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── フッター ── */}
      <footer className="px-8 pb-6 flex items-center justify-between shrink-0 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-6 text-[11px] text-slate-400">
          <span>診断</span>
          <span className="text-slate-200">→</span>
          <span>AI分析</span>
          <span className="text-slate-200">→</span>
          <span>マッチング</span>
          <span className="text-slate-200">→</span>
          <span>出会う</span>
        </div>
        <span className="text-[11px] text-slate-300">© 2026 ZAX</span>
      </footer>

    </main>
  );
}
