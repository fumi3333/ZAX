import { prisma } from '@/lib/db/client';
import { questions } from '@/data/questions';
import { notFound } from 'next/navigation';
import ResultRadarChart from '@/components/diagnostic/ResultRadarChart';
import Link from 'next/link';
import { ArrowRight, Sparkles, Share2 } from 'lucide-react';

export default async function DiagnosticResultPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const result = await prisma.diagnosticResult.findUnique({
    where: { id },
  });

  if (!result) {
    notFound();
  }

  const answers = JSON.parse(result.answers) as Record<number, number>;

  // Calculate scores
  const categoryScores: Record<string, { sum: number; count: number; label: string }> = {};

  // Initialize categories based on questions to ensure order or existence
  questions.forEach(q => {
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { sum: 0, count: 0, label: q.categoryJa };
    }
  });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find(q => q.id === Number(qId));
    if (q) {
        categoryScores[q.category].sum += score;
        categoryScores[q.category].count += 1;
    }
  });

  const chartData = Object.keys(categoryScores).map(key => ({
    subject: categoryScores[key].label,
    A: parseFloat((categoryScores[key].sum / categoryScores[key].count).toFixed(1)),
    fullMark: 5,
  }));

  // Format synthesis text (assuming markdown-ish or plain text)
  // We'll just display it as paragraphs for now.
  const synthesisParagraphs = result.synthesis.split('\n').filter((p: string) => p.trim() !== '');

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
       {/* Header */}
       <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Link href="/" className="font-black text-xl tracking-tight flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  ZAX
              </Link>
          </div>
       </header>

       <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          
          {/* Hero Section */}
          <section className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  ANALYSIS COMPLETE
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                  あなたの<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">本質的特性</span>
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto">
                  回答データから抽出された、あなたの行動特性と価値観の分析結果です。
              </p>
          </section>

          {/* Chart Section */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-8 text-center">特性レーダーチャート</h2>
              <div className="flex justify-center">
                  <div className="w-full max-w-md">
                      <ResultRadarChart data={chartData} />
                  </div>
              </div>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  {chartData.map((item) => (
                      <div key={item.subject} className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 font-bold mb-1">{item.subject}</div>
                          <div className="text-2xl font-black text-slate-900">{item.A}</div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Synthesis Section */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
                 <Sparkles className="w-6 h-6 text-yellow-400" />
                 AI・心理分析レポート
             </h2>
             
             <div className="space-y-6 text-lg leading-relaxed text-slate-300 relative z-10 font-medium">
                 {synthesisParagraphs.map((para: string, i: number) => (
                    // Simple logic to detect headers in plain text if Gemini output markdown
                    para.startsWith('#') ? 
                        <h3 key={i} className="text-xl font-bold text-white mt-6 mb-2">{para.replace(/^#+\s/, '')}</h3> :
                        <p key={i}>{para}</p>
                 ))}
             </div>
          </section>

          {/* Action Section */}
          <section className="text-center pt-12">
              <Link href="/product" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                  共鳴する相手を探す
                  <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="mt-6 text-sm text-slate-400">
                  あなたのベクトルは保存され、マッチングに使用されます。
              </p>
          </section>

       </main>
    </div>
  );
}
