"use client";

import { useEffect, useState } from "react";
import { questions, effectiveScore } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import MatchResults from "./MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ResultData {
  id: string;
  synthesis: string;
  answers: Record<string, number>;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {
        setError("データの読み込みに失敗しました");
      }
      setLoading(false);
      return;
    }
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => setError("結果の取得に失敗しました。もう一度診断をお試しください。"))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-slate-600 mb-6">{error || "結果が見つかりませんでした"}</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            診断をやり直す
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const answers = data.answers;

  // 5カテゴリ（質問ベース）のスコア計算
  const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
  const categoryScores: Record<string, { sum: number; count: number }> = {};
  CATEGORY_ORDER.forEach((c) => { categoryScores[c] = { sum: 0, count: 0 }; });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find((q) => q.id === Number(qId));
    const rawScore = Number(score);
    if (q && categoryScores[q.category] && !isNaN(rawScore)) {
      categoryScores[q.category].sum += effectiveScore(q, rawScore);
      categoryScores[q.category].count += 1;
    }
  });

  // 0-100スケールの生スコア（カテゴリ順: Social, Empathy, Discipline, Openness, Emotional）
  const rawByCat = CATEGORY_ORDER.map((c) => {
    const d = categoryScores[c];
    const avg = d.count > 0 ? d.sum / d.count : 4;
    return Math.round(((avg - 1) / 6) * 100);
  });
  const [social, empathy, discipline, openness, emotional] = rawByCat;

  // マッチングと同じ6次元にマッピング: 論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性
  const userVector6d: number[] = [
    discipline,   // 論理性 ← 誠実性
    openness,     // 直感力 ← 開放性
    empathy,      // 共感性 ← 協調性
    discipline,   // 意志力 ← 誠実性
    openness,     // 創造性 ← 開放性
    Math.round((emotional + social) / 2),  // 柔軟性 ← 情緒安定性・外向性
  ];

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = data.synthesis
    .split("\n")
    .filter((p: string) => p.trim() !== "")
    .map((p: string) => p.replace(/AI・?/g, "").replace(/AI分析/g, "分析"));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            分析完了
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            あなたの
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              性格特性
            </span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            回答データから抽出された、あなたの行動特性と価値観の分析結果です。
          </p>
        </section>

        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
          <h2 className="text-2xl font-bold mb-8 text-center">特性レーダーチャート</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResultRadarChart data={chartData} />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.subject} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 font-bold mb-1">{item.subject}</div>
                <div className="text-2xl font-black text-slate-900">{item.A}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            心理分析レポート
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-slate-300 relative z-10 font-medium">
            {synthesisParagraphs.map((para: string, i: number) =>
              para.startsWith("#") ? (
                <h3 key={i} className="text-xl font-bold text-white mt-6 mb-2">
                  {para.replace(/^#+\s/, "")}
                </h3>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </div>
        </section>

        <MatchResults userVector={userVector6d} synthesis={data.synthesis} />

        <section className="text-center pt-8">
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
          >
            もう一度診断する
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-slate-400">ベクトルは出会いごとに更新されます。</p>
        </section>
      </main>
    </div>
  );
}
