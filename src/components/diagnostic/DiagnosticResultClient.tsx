"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import MatchResults from "./MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ResultData {
  id: string;
  synthesis: string;
  answers: Record<string, number>;
  vector?: number[] | string;
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
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            履歴から再解析する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const answers = data.answers || {};
  // Prioritize the vector from the data (History Analysis result)
  let userVector6d: number[] = [50, 50, 50, 50, 50, 50];

  if (data.vector && Array.isArray(data.vector)) {
    userVector6d = data.vector;
  } else if (data.vector && typeof data.vector === 'string') {
    try {
        userVector6d = JSON.parse(data.vector);
    } catch {
        console.warn("Failed to parse vector string");
    }
  } else {
    // 5カテゴリ（質問ベース）の旧計算ロジック（質問回答がある場合のみ実行）
    const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const categoryScores: Record<string, { sum: number; count: number }> = {};
    CATEGORY_ORDER.forEach((c) => { categoryScores[c] = { sum: 0, count: 0 }; });

    Object.entries(answers).forEach(([qId, score]) => {
      const q = questions.find((q) => q.id === Number(qId));
      if (q && categoryScores[q.category]) {
        categoryScores[q.category].sum += score;
        categoryScores[q.category].count += 1;
      }
    });

    const rawByCat = CATEGORY_ORDER.map((c) => {
      const d = categoryScores[c];
      const avg = d.count > 0 ? d.sum / d.count : 4;
      return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;

    userVector6d = [
      discipline,   // 論理性 ← 誠実性
      openness,     // 直感力 ← 開放性
      empathy,      // 共感性 ← 協調性
      discipline,   // 意志力 ← 誠実性
      openness,     // 創造性 ← 開放性
      Math.round((emotional + social) / 2),  // 柔軟性 ← 情緒安定性・外向性
    ];
  }

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 fill-white text-white" />
            分析完了
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            あなたの<br />
            性格特性
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
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

        <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
            <Sparkles className="w-6 h-6 text-white opacity-80" />
            心理分析レポート
          </h2>
          
          <div className="relative z-10">
            {(data.synthesis && data.synthesis !== "分析中..." && !data.synthesis.includes("登録後") && !data.synthesis.includes("エラー")) ? (
              <div className="relative">
                <div className="space-y-6 text-lg leading-relaxed text-slate-300 font-medium filter blur-md select-none opacity-40">
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
                
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-slate-900/95 p-8 rounded-2xl text-center border border-slate-700 shadow-2xl max-w-md mx-auto backdrop-blur-sm">
                     <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
                        <Sparkles className="w-12 h-12 text-slate-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">詳細レポートの閲覧と保存</h3>
                     <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                       これより先の詳細な心理分析レポートの閲覧と、診断結果の保存には大学メアドでの登録が必要です。
                     </p>
                     <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                     >
                       大学メアドで登録する
                       <ArrowRight className="w-4 h-4" />
                     </Link>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-10 text-center relative z-10">
                 <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
                    <Sparkles className="w-12 h-12 text-slate-500" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold text-white">詳細レポートの閲覧と保存</h3>
                   <p className="text-slate-400 max-w-md mx-auto">
                     詳細な心理分析レポートの閲覧と、診断結果の保存には大学メアドでの登録が必要です。
                   </p>
                 </div>
                 <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                 >
                   大学メアドで登録する
                   <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
            )}
          </div>
        </section>

        <MatchResults userVector={userVector6d} synthesis={data.synthesis} />

        <section className="bg-white rounded-3xl p-8 md:p-12 text-center space-y-8 border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900">共鳴マッチを始めましょう</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              マッチ登録をして、あなたと共鳴するパートナーとチャットを始めましょう。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:-translate-y-1"
             >
                マッチ登録する
                <ArrowRight className="w-6 h-6" />
             </Link>
          </div>
        </section>

        <section className="text-center pt-8">
          <Link
            href="/history"
            className="text-slate-400 text-sm font-bold hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            履歴から再解析する
          </Link>
        </section>
      </main>
    </div>
  );
}
