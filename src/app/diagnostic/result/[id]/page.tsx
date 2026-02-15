import { prisma } from "@/lib/db/client";
import { questions } from "@/data/questions";
import { notFound } from "next/navigation";
import ResultRadarChart from "@/components/diagnostic/ResultRadarChart";
import MatchResults from "@/components/diagnostic/MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function DiagnosticResultPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const result = await prisma.diagnosticResult.findUnique({
    where: { id },
  });

  if (!result) {
    notFound();
  }

  const answers = JSON.parse(result.answers) as Record<number, number>;

  // ─── カテゴリ別スコア計算 ───
  const categoryScores: Record<
    string,
    { sum: number; count: number; label: string }
  > = {};

  questions.forEach((q) => {
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { sum: 0, count: 0, label: q.categoryJa };
    }
  });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find((q) => q.id === Number(qId));
    if (q) {
      categoryScores[q.category].sum += score;
      categoryScores[q.category].count += 1;
    }
  });

  const chartData = Object.keys(categoryScores).map((key) => ({
    subject: categoryScores[key].label,
    A: parseFloat(
      (categoryScores[key].sum / categoryScores[key].count).toFixed(1)
    ),
    fullMark: 5,
  }));

  // ─── 6次元ベクトル計算 (1-7スケール → 0-100スケール) ───
  const dimensionOrder = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ];

  // カテゴリ平均を0-100に変換 (1-7 → 0-100)
  const rawScores = Object.keys(categoryScores).map((key) => {
    const avg = categoryScores[key].sum / categoryScores[key].count;
    return Math.round(((avg - 1) / 6) * 100);
  });

  // 6次元に正規化 (5カテゴリ → 6次元: 最後に全体バランスを追加)
  const avgAll =
    rawScores.length > 0
      ? Math.round(rawScores.reduce((a, b) => a + b, 0) / rawScores.length)
      : 50;
  const userVector6d =
    rawScores.length >= 5
      ? [...rawScores.slice(0, 5), avgAll]
      : [50, 50, 50, 50, 50, 50];

  // ─── 分析テキスト ───
  const synthesisParagraphs = result.synthesis
    .split("\n")
    .filter((p: string) => p.trim() !== "");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Spacer for fixed header */}
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* ─── Hero ─── */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            ANALYSIS COMPLETE
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

        {/* ─── Radar Chart ─── */}
        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
          <h2 className="text-2xl font-bold mb-8 text-center">
            特性レーダーチャート
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResultRadarChart data={chartData} />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.subject} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 font-bold mb-1">
                  {item.subject}
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {item.A}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── AI Analysis ─── */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            AI・心理分析レポート
          </h2>

          <div className="space-y-6 text-lg leading-relaxed text-slate-300 relative z-10 font-medium">
            {synthesisParagraphs.map((para: string, i: number) =>
              para.startsWith("#") ? (
                <h3
                  key={i}
                  className="text-xl font-bold text-white mt-6 mb-2"
                >
                  {para.replace(/^#+\s/, "")}
                </h3>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </div>
        </section>

        {/* ─── Matching Results ─── */}
        <MatchResults userVector={userVector6d} />

        {/* ─── CTA ─── */}
        <section className="text-center pt-8">
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
          >
            もう一度診断する
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-slate-400">
            ベクトルは出会いごとに更新されます。
          </p>
        </section>
      </main>
    </div>
  );
}
