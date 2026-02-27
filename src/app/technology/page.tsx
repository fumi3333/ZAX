"use client";

import { motion } from "framer-motion";
import { Database, Network, ShieldCheck, Layers, ArrowRight, BrainCircuit, TrendingUp, Users } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
      {/* Subtle ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-blue-50/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-violet-50/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 lg:pt-36">
        {/* ─── HERO ─── */}
        <motion.div {...fade} className="mb-20 lg:mb-28">
          <span className="inline-block px-3 py-1 mb-6 rounded-full bg-white text-slate-500 text-xs font-medium tracking-wider border border-slate-200/60 shadow-sm">
            PRODUCT ARCHITECTURE
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            ZAX: Product Architecture
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            ZAXは、個人の内面的特性を多次元データとして捉え、相互作用による「個人の変容」を
            記録・最適化する、<span className="font-semibold text-slate-900">動的マッチングOS</span>です。
          </p>
        </motion.div>

        {/* ─── 1. DATA ARCHITECTURE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">1. データ・アーキテクチャ</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXは、ユーザーを固定された属性ではなく、流動的な<span className="font-semibold text-slate-900">「Identity Vector」</span>として定義します。
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">カテゴリ</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">保持するデータ項目</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase hidden md:table-cell">役割</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Core Trait</td>
                  <td className="px-6 py-4 text-slate-600">価値観、思考のプロセス、深層的な関心事</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">マッチングの基礎となる基準点</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Interaction Log</td>
                  <td className="px-6 py-4 text-slate-600">接続時間、反応率、対話の深度</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">共鳴の強さを測定する</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-900">Delta State</td>
                  <td className="px-6 py-4 text-slate-600">興味関心の移行や言語表現の変化</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">個人の変容（変化量）を記録する</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ─── 2. TRANSFORMATION TRACKING ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold">2. 相互変容トラッキング</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXの最大の特徴は、単なる「マッチング」で終わらず、その後の
            <span className="font-semibold text-slate-900">「変容（Transformation）」</span>をシステムが評価する点にあります。
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">影響力の解析</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ユーザーAとBが接触した際、双方のデータセットにどのような変化が生じたかを時系列で追跡します。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">変容のフィードバック</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                「誰と関わった時に、どのような新しい視点や行動変容が生まれたか」を蓄積し、成長を引き起こすための予測モデルに反映させます。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── 3. MATCHING LOGIC ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">3. マッチング・ロジックのフロー</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            システムは以下のサイクルを自動で回し続け、コミュニティ全体の共鳴密度を高めます。
          </p>
          <div className="space-y-4">
            {[
              { num: "01", title: "高精度な推論（Reasoning）", desc: "入力された断片的なデータから、推論型AIを用いてユーザーの潜在的な「共鳴点」を特定します。" },
              { num: "02", title: "未来予測シミュレーション", desc: "候補者同士をマッチングさせた場合、互いにどのような変容をもたらすかを予測し、期待値の高い組み合わせを選出します。" },
              { num: "03", title: "レゾナンス・エンジンの実行", desc: "算出された共鳴係数に基づいて接続を提案します。" },
              { num: "04", title: "変容データの書き戻し", desc: "実際の対面・対話後の変化を再度ベクトル化し、データベースを更新します。" },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 flex gap-5">
                <span className="text-sm font-bold text-slate-300 mt-0.5">{step.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-xs mb-3 tracking-wider uppercase">Resonance Score Formula</p>
            <p className="text-white font-mono text-lg">
              R<sub>score</sub> = ∫<sub>t₀</sub><sup>t₁</sup> f(A, B) dt
            </p>
            <p className="text-slate-500 text-xs mt-3">
              R<sub>score</sub>：期間 t における共鳴と変容の累積値
            </p>
          </div>
        </motion.section>

        {/* ─── 4. GOVERNANCE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">4. テクニカル・ガバナンス</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">高セキュアなインフラ構成</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                暗号化通信の徹底と、個人の内面データを匿名化した状態での計算処理。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">スケーラビリティ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                小規模なコミュニティから大規模な組織まで、負荷に応じて動的にリソースを拡張するクラウドアーキテクチャ。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── PHASE 1 ─── */}
        <motion.section {...fade} className="mb-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-10">
            <span className="inline-block px-3 py-1 mb-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider">
              PHASE 1: EXPERIENCE MIRRORING
            </span>
            <h2 className="text-2xl font-bold mb-4">学内幸福ナビゲーション</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              新入生の孤独を解消し、データに基づいた自己理解と最適な友人作りを支援するフェーズ1。
              AIに「重みを更新」させる前段階として、「ユーザーの外部記憶」を構築し、自己変容の軌跡を可視化します。
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {[
                { title: "履歴ベースのベクトル解析", desc: "YouTubeの視聴履歴から「今の関心と価値観」をリアルタイム推定。自分でも気づかなかった自分を知る。" },
                { title: "AI自己理解壁打ち", desc: "RAGを用いて過去の自分と対話。悩み事に対し、過去の成功体験からAIが助言。" },
                { title: "ベクトル・マッチング", desc: "潜在的な「価値観の近さ」で学生同士を繋ぎ、本当に気の合う友達に出会える確率を向上。" },
                { title: "シミュレーション・グラフ", desc: "入学時から現在までの思考ベクトルの軌跡を可視化。大学生活での変化・成長が一目でわかる。" },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-2">フェーズ2への接続</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                このフェーズで蓄積された「変化のプロセス（Before → Action → After）」の膨大なログは、
                後のフェーズで行う基盤モデルのファインチューニングや進化的マージの「正解データ」として活用されます。
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
