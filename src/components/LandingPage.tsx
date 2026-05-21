"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// 散布図のドット（人格の座標群）
const DOTS = [
  { x: 18, y: 22 }, { x: 32, y: 55 }, { x: 48, y: 18 },
  { x: 62, y: 70 }, { x: 75, y: 35 }, { x: 85, y: 60 },
  { x: 25, y: 72 }, { x: 55, y: 45 }, { x: 40, y: 80 },
  { x: 70, y: 20 }, { x: 15, y: 48 }, { x: 88, y: 82 },
  { x: 50, y: 62 }, { x: 30, y: 35 }, { x: 78, y: 50 },
];

// 「補完し合う2人」— 中程度の距離感
const YOU =  { x: 38, y: 42 };
const THEM = { x: 64, y: 58 };

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="w-full h-screen bg-white text-slate-900 flex flex-col overflow-hidden">

      {/* ヘッダー */}
      <header className="px-8 pt-6 flex items-center justify-between shrink-0 relative">
        <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-900">ZAX</span>

        {/* ハンバーガーメニュー */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-[5px] p-2 group"
            aria-label="メニュー"
          >
            <span className={`block w-5 h-[1.5px] bg-slate-900 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-900 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-900 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-44 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <Link
                  href="/mypage"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  過去のログを見る
                </Link>
                <Link
                  href="/diagnostic"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-50"
                >
                  診断を始める
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-xs text-slate-400 hover:bg-slate-50 transition-colors border-t border-slate-50"
                >
                  プライバシーポリシー
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* メイン：左テキスト・右ビジュアル */}
      <div className="flex-1 grid grid-cols-[1fr_1.1fr] min-h-0">

        {/* ── 左：コピー ── */}
        <div className="flex flex-col justify-center px-12 gap-7">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* タグ */}
            <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 border border-slate-200 rounded-full px-3 py-1">
              価値観診断 × AI × マッチング
            </span>

            {/* メインコピー */}
            <h1 className="text-[2.6rem] font-black leading-[1.15] tracking-tight text-slate-900">
              あなたを、<br />
              座標にする。
            </h1>

            {/* サブ */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              60問の診断でAIがあなたの本質を数値化。<br />
              完全一致ではなく、<em className="not-italic text-slate-600 font-medium">補完し合える相手</em>と出会う。
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col gap-2"
          >
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 w-fit px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-all"
            >
              診断を始める
              <span>→</span>
            </Link>
            <p className="text-[11px] text-slate-300">登録不要 · 無料 · 約5分</p>
          </motion.div>

          {/* 数字 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-6 pt-2 border-t border-slate-100"
          >
            {[
              { n: "60", label: "診断問題" },
              { n: "6", label: "分析軸" },
              { n: "AI", label: "分析エンジン" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xl font-black text-slate-900">{item.n}</div>
                <div className="text-[10px] text-slate-400">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── 右：散布図ビジュアル ── */}
        <div className="flex items-center justify-center bg-slate-50 relative overflow-hidden border-l border-slate-100">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full relative"
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* グリッド線 */}
              {[20, 40, 60, 80].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1={v} x2="100" y2={v} stroke="#f1f5f9" strokeWidth="0.5" />
                </g>
              ))}

              {/* 軸ラベル */}
              <text x="50" y="98" textAnchor="middle" fontSize="2.5" fill="#cbd5e1" fontFamily="sans-serif">好奇心・行動力</text>
              <text x="2" y="50" textAnchor="middle" fontSize="2.5" fill="#cbd5e1" fontFamily="sans-serif" transform="rotate(-90, 2, 50)">寛容性・共感力</text>

              {/* 一般ドット群 */}
              {DOTS.map((d, i) => (
                <motion.circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r="1.2"
                  fill="#e2e8f0"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                  style={{ transformOrigin: `${d.x}% ${d.y}%` }}
                />
              ))}

              {/* 2人の接続線 */}
              <motion.line
                x1={YOU.x} y1={YOU.y}
                x2={THEM.x} y2={THEM.y}
                stroke="#64748b"
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />

              {/* あなた */}
              <motion.circle
                cx={YOU.x} cy={YOU.y} r="2.2"
                fill="#0f172a"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4, type: "spring" }}
                style={{ transformOrigin: `${YOU.x}% ${YOU.y}%` }}
              />
              <motion.text
                x={YOU.x - 1} y={YOU.y - 3.5}
                textAnchor="middle" fontSize="2.2" fill="#0f172a"
                fontWeight="700" fontFamily="sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                あなた
              </motion.text>

              {/* マッチ相手 */}
              <motion.circle
                cx={THEM.x} cy={THEM.y} r="2.2"
                fill="#475569"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
                style={{ transformOrigin: `${THEM.x}% ${THEM.y}%` }}
              />
              <motion.text
                x={THEM.x + 1} y={THEM.y - 3.5}
                textAnchor="middle" fontSize="2.2" fill="#475569"
                fontWeight="700" fontFamily="sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                引き合う相手
              </motion.text>

              {/* 補完性スコアラベル */}
              <motion.rect
                x="44" y="46" width="16" height="5" rx="1"
                fill="white" stroke="#e2e8f0" strokeWidth="0.4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              />
              <motion.text
                x="52" y="49.8"
                textAnchor="middle" fontSize="2.2" fill="#64748b"
                fontFamily="sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                補完性 82%
              </motion.text>
            </svg>
          </motion.div>
        </div>
      </div>

    </main>
  );
}
