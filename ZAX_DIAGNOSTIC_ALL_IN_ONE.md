# ZAX Diagnostic & Database All-in-One Source (Final Flow)

統合日: 2026/2/26 23:30:13

## File: src/data/questions.ts

`typescript
export type Question = {
  id: number;
  text: string;
  category: 'Social' | 'Empathy' | 'Discipline' | 'Openness' | 'Emotional';
  categoryJa: string;
  reverse?: boolean;
};

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  { id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' },
  { id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' },
  { id: 4, text: "注目を浴びることに抵抗がない、むしろ好きだ。", category: 'Social', categoryJa: '外向性' },
  { id: 5, text: "自分の感情や考えを、すぐに言葉にして表現する方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 6, text: "パーティーや交流会など、人が多い場所に行くとエネルギーをもらえる。", category: 'Social', categoryJa: '外向性' },
  { id: 7, text: "電話よりもテキストメッセージでのやり取りを好む。", category: 'Social', categoryJa: '外向性' }, // Note: Reverse score logic will be handled in analysis if needed, but for vectorization raw score + text is fine.
  { id: 8, text: "誰かと一緒にいるとき、沈黙が続くと気まずいと感じる。", category: 'Social', categoryJa: '外向性' },
  { id: 9, text: "浅く広い付き合いよりも、狭く深い付き合いを好む。", category: 'Social', categoryJa: '外向性' },
  { id: 10, text: "他人の意見に流されず、自分の主張をはっきりと伝えることができる。", category: 'Social', categoryJa: '外向性' },

  // Empathy & Harmony (協調性・共感性)
  { id: 11, text: "他人の感情の変化に敏感で、すぐ気がつく方だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 12, text: "困っている人がいると、自分のことを後回しにしてでも助けたくなる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 13, text: "議論で勝つことよりも、相手との調和を保つことの方が重要だと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 14, text: "人を批判するよりも、良いところを見つけて褒めるようにしている。", category: 'Empathy', categoryJa: '協調性' },
  { id: 15, text: "自分の利益よりも、チームやコミュニティ全体の利益を優先する。", category: 'Empathy', categoryJa: '協調性' },
  { id: 16, text: "映画や小説の登場人物に感情移入して泣いてしまうことがある。", category: 'Empathy', categoryJa: '協調性' },
  { id: 17, text: "他人の失敗に対して寛容であり、すぐに許すことができる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 18, text: "嘘をつくことは、どんな理由があっても良くないと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 19, text: "人からの頼み事を断るのが苦手だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 20, text: "競争する環境よりも、協力し合う環境の方が能力を発揮できる。", category: 'Empathy', categoryJa: '協調性' },

  // Discipline & Order (誠実性・規律)
  { id: 21, text: "部屋や机の上は常に整理整頓されている。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 22, text: "計画を立ててから行動する方で、行き当たりばったりの行動は避ける。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 23, text: "期限や約束の時間は必ず守る。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 24, text: "一度始めたことは、どんなに困難でも最後までやり遂げる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 25, text: "細かい部分まで注意を払い、ミスがないよう徹底するタイプだ。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 26, text: "ルールや規則は、社会秩序のために厳格に守るべきだと思う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 27, text: "衝動買いをすることはほとんどなく、慎重にお金を使う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 28, text: "目標達成のためなら、目先の快楽を我慢できる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 29, text: "効率性を重視し、無駄な作業は極力省きたい。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 30, text: "何事も準備不足だと不安を感じる。", category: 'Discipline', categoryJa: '誠実性' },

  // Openness & Curiosity (開放性・知的好奇心)
  { id: 31, text: "抽象的な概念や哲学的な議論をするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 32, text: "伝統や慣習よりも、新しい方法や革新的なアイデアに惹かれる。", category: 'Openness', categoryJa: '開放性' },
  { id: 33, text: "美術館に行ったり、芸術作品に触れたりするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 34, text: "予測可能な日常よりも、変化に富んだ刺激的な毎日を求めている。", category: 'Openness', categoryJa: '開放性' },
  { id: 35, text: "未知の分野や新しい趣味に挑戦することにワクワクする。", category: 'Openness', categoryJa: '開放性' },
  { id: 36, text: "物事を多角的な視点から見るのが得意だ。", category: 'Openness', categoryJa: '開放性' },
  { id: 37, text: "「なぜ？」と根本的な理由を考えることがよくある。", category: 'Openness', categoryJa: '開放性' },
  { id: 38, text: "SF映画やファンタジー小説など、現実離れした世界観が好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 39, text: "自分の価値観が絶対だとは思わず、多様な考え方を受け入れられる。", category: 'Openness', categoryJa: '開放性' },
  { id: 40, text: "クリエイティブな活動（執筆、描画、制作など）に時間を費やすのが好きだ。", category: 'Openness', categoryJa: '開放性' },

  // Emotional Logic / Stability (情緒安定性・メンタル)
  { id: 41, text: "プレッシャーのかかる状況でも、冷静に対処できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 42, text: "些細なことでイライラしたり、落ち込んだりすることは少ない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 43, text: "将来に対して不安を感じるより、楽観的に考えることが多い。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 44, text: "失敗しても、すぐに気持ちを切り替えて次の行動に移せる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 45, text: "他人からの批判を個人的な攻撃として受け取らず、冷静に分析できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 46, text: "感情の起伏が激しい方ではない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 47, text: "リラックスする時間を意識的に確保している。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 48, text: "自分の弱みを見せることに抵抗がない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 49, text: "予期せぬトラブルが起きてもパニックにならずに対応できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 50, text: "自分自身に対して自信を持っており、自己肯定感が高い。", category: 'Emotional', categoryJa: '情緒安定性' },

  // -- 追加質問 --
  { id: 51, text: "自分と異なる意見を持つ相手とも、深い信頼関係を築ける。", category: 'Openness', categoryJa: '開放性' },
  { id: 52, text: "ストレスが溜まったときは、誰かに話すより一人で静かに過ごしたい。", category: 'Social', categoryJa: '外向性', reverse: true },
  { id: 53, text: "人生において安定よりも刺激や挑戦を常に求めていたい。", category: 'Openness', categoryJa: '開放性' },
  { id: 54, text: "自分の志や目的のためなら、周囲の環境が変わることも厭わない。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 55, text: "広く浅い人脈よりも、深く狭い信頼関係の方が価値がある。", category: 'Social', categoryJa: '外向性', reverse: true },
  { id: 56, text: "物事を判断する基準は、社会的な常識よりも自分の信念に基づいている。", category: 'Discipline', categoryJa: '誠実性', reverse: true },
  { id: 57, text: "何か問題が起きたとき、感情に寄り添うよりも先に解決策を提示してほしい。", category: 'Empathy', categoryJa: '協調性', reverse: true },
  { id: 58, text: "自分に自信がある方だ。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 59, text: "どんなに親しい間柄でも、踏み込ませないパーソナルスペースが必要だ。", category: 'Social', categoryJa: '外向性', reverse: true },
];

/** 1-7スケールで逆転項目の場合は 8 - score を返す */
export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}

`

---

## File: src/components/diagnostic/DiagnosticWizard.tsx

`typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { questions } from '@/data/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function DiagnosticWizard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [freetext, setFreetext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const cardRef = useRef<HTMLDivElement>(null);

  const totalQuestions = questions.length;
  const isFinalStep = currentQuestionIndex === totalQuestions;
  const currentQuestion = !isFinalStep ? questions[currentQuestionIndex] : null;
  
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions && freetext.trim().length > 5;

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance
    setTimeout(() => {
      setDirection('next');
      setCurrentQuestionIndex((prev) => prev + 1);
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions) {
      setDirection('next');
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection('prev');
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, freetext }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        window.location.href = `/diagnostic/result/${data.id}`;
      } else {
        console.error('Failed to submit:', data.error);
        alert('エラーが発生しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      alert('通信エラーが発生しました。ブラウザのコンソールを確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: 1, label: '同意しない', color: 'bg-red-500', size: 'w-16 h-16', border: 'border-red-500' },
    { value: 2, label: '', color: 'bg-red-400', size: 'w-12 h-12', border: 'border-red-400' },
    { value: 3, label: '', color: 'bg-red-300', size: 'w-8 h-8', border: 'border-red-300' },
    { value: 4, label: '中立', color: 'bg-slate-200', size: 'w-6 h-6', border: 'border-slate-300' },
    { value: 5, label: '', color: 'bg-green-300', size: 'w-8 h-8', border: 'border-green-300' },
    { value: 6, label: '', color: 'bg-green-400', size: 'w-12 h-12', border: 'border-green-400' },
    { value: 7, label: '同意する', color: 'bg-green-500', size: 'w-16 h-16', border: 'border-green-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative perspective-1000">
          <Card 
            ref={cardRef}
            className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500"
          >
            <CardContent className="p-8 sm:p-12 text-center space-y-10">
              
              {!isFinalStep && currentQuestion ? (
                <>
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300" key={currentQuestionIndex}>
                    <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                        質問 {currentQuestion.id} / {totalQuestions}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                      {currentQuestion.text}
                    </h2>
                  </div>

                  <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                    <div className="hidden sm:block text-xs font-bold text-red-500/80 mr-2">同意しない</div>
                    {options.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.value;
                      const isAnswered = answers[currentQuestion.id] !== undefined;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(opt.value)}
                          className={`
                            rounded-full transition-all duration-300 flex items-center justify-center
                            ${opt.size}
                            ${isSelected 
                              ? `${opt.color} ring-4 ring-offset-2 ring-indigo-100 scale-110` 
                              : `bg-transparent border-2 ${opt.border} hover:bg-slate-50`
                            }
                            ${!isSelected && isAnswered ? 'opacity-40 hover:opacity-100' : 'opacity-100'}
                          `}
                          aria-label={`Select option ${opt.value}`}
                        >
                          {isSelected && <Check className="text-white w-5 h-5 stroke-[3px]" />}
                        </button>
                      );
                    })}
                    <div className="hidden sm:block text-xs font-bold text-green-600/80 ml-2">同意する</div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">最後に、教えてください</h2>
                    <p className="text-sm text-slate-500">
                      最近の悩みや、これから挑戦したいこと、大切にしている価値観などを自由に入力してください（詳細なほど分析が正確になります）。
                    </p>
                  </div>
                  <textarea
                    value={freetext}
                    onChange={(e) => setFreetext(e.target.value)}
                    placeholder="例：もっと論理的な思考を身につけたい。自分の直感をもっと信じて動けるようになりたい。"
                    className="w-full min-h-[150px] p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition-all resize-none bg-white text-slate-700 font-medium"
                  />
                  {!allAnswered && answeredCount === totalQuestions && (
                    <p className="text-xs text-amber-500 font-bold">分析を開始するには、自由記述を入力してください（5文字以上）。</p>
                  )}
                </div>
              )}

              <div className="flex sm:hidden justify-between text-xs font-bold text-slate-400 px-2">
                <span className="text-red-500">同意しない</span>
                <span className="text-green-600">同意する</span>
              </div>

            </CardContent>
          </Card>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          前へ
        </Button>

        {isFinalStep ? (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !allAnswered}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? '分析中...' : (
              <>
                診断結果を見る
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        ) : (
          <div className="text-xs text-slate-300">
            {answeredCount} / {totalQuestions} 問回答済み
          </div>
        )}
      </div>
    </div>
  );
}

`

---

## File: src/components/diagnostic/DiagnosticResultClient.tsx

`typescript
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
    if (q && categoryScores[q.category]) {
      categoryScores[q.category].sum += score;
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

        {/* 登録誘導セクション */}
        <section className="bg-white rounded-3xl p-8 md:p-12 text-center space-y-8 border-2 border-indigo-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900">マッチングを開始しますか？</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              大学のメールアドレスを登録すると、今回の診断結果に基づいて、あなたの価値観と深く響き合う相手をAIが自動でマッチングします。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1"
             >
                大学メアドで登録して開始
                <ArrowRight className="w-6 h-6" />
             </Link>
             <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all"
             >
                今は登録しない
             </Link>
          </div>
          <p className="text-xs text-slate-400">※登録しなくても、この診断結果はブラウザに一時的に保存されます。</p>
        </section>

        <section className="text-center pt-8">
          <Link
            href="/diagnostic"
            className="text-slate-400 text-sm font-bold hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            診断をやり直す
          </Link>
        </section>
      </main>
    </div>
  );
}

`

---

## File: src/app/api/diagnostic/submit/route.ts

`typescript
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini'; // Import shared instances
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { answers, freetext } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate User (or create guest session)
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        const email = `guest_${sessionId}@musashino-u.ac.jp`;
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
             try {
                user = await prisma.user.create({ data: { email, password: "guest-password" } });
             } catch (e) {
                 const firstUser = await prisma.user.findFirst();
                 if (firstUser) user = firstUser;
                 else throw new Error("Could not create or find user");
             }
        }
    }
    if (user) userId = user.id;

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断（1-7尺度）の回答と自由記述に基づき、深い分析を行ってください。\n\n";
    
    if (freetext) {
        profileText += `## 本人の自由記述（悩み、理想、価値観）\n"${freetext}"\n\n`;
    }

    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      const score = answers[id];
      if (q) {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += score;
        categoryScores[q.categoryJa].count += 1;
      }
    }

    profileText += "## 診断スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        profileText += `- ${cat}: 平均 ${(data.sum / data.count).toFixed(1)}/7.0\n`;
    }

    profileText += "\n指示: この人物の強み、弱み、コミュニケーションスタイル、適した環境について、プロの心理分析官として詳細なレポートを作成してください。回答には自由記述の内容も深く反映させてください。出力に「AI」という語は含めないでください。";

    // 3. Call Gemini for Synthesis
    let synthesis = "分析中...";
    try {
        const result = await model.generateContent(profileText);
        const response = await result.response;
        synthesis = response.text() || synthesis;
    } catch (e) {
        console.warn("Gemini API Error (Synthesis):", e);
    }

    // 4. 6次元ベクトル (レーダーチャート用)
    const categoryOrder = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const jaMap: Record<string, string> = { 'Social': '外向性', 'Empathy': '協調性', 'Discipline': '誠実性', 'Openness': '開放性', 'Emotional': '情緒安定性' };
    const rawByCat = categoryOrder.map(c => {
        const d = categoryScores[jaMap[c]];
        const avg = d && d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector6d = [discipline, openness, empathy, discipline, openness, Math.round((emotional + social) / 2)];

    // 4.5. 768次元ベクトル (セマンティック検索用)
    let embedding768: number[] | undefined = undefined;
    try {
        const embedText = `Synthesis: ${synthesis}\nFreetext: ${freetext || "N/A"}`;
        const embeddingResult = await embeddingModel.embedContent(embedText);
        embedding768 = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.warn("Gemini API Error (Embedding):", e);
    }

    // 5. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(vector6d),
      },
    });

    await vectorStore.saveEmbedding(
        userId,
        vector6d,
        "性格診断結果と自由記述に基づく分析",
        1.0,
        embedding768 // 768次元を追加
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: answers,
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

`

---

## File: prisma/schema.prisma

`prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"] // 拡張機能を有効化
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector] // pgvector拡張
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcryptでハッシュ化されたパスワード
  createdAt DateTime @default(now())
  
  // Relations
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]

  @@map("users")
}

model EssenceVector {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 6次元のエッセンスベクトル (検索・表示用)
  vector         Unsupported("vector(6)") 
  
  // 768次元のセマンティック埋め込み (深い分析・履歴検索用)
  embedding      Unsupported("vector(768)")? 
  
  // JSON文字列表現 (フロントエンド表示用バックアップ)
  vectorJson     String   

  reasoning      String   
  resonanceScore Float    @default(0.0)
  createdAt      DateTime @default(now())

  @@map("essence_vectors")
}

model Feedback {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String
  deltaVector String   // JSON string
  growthScore Float
  createdAt   DateTime @default(now())

  @@map("feedbacks")
}

model Interaction {
  id String @id @default(uuid())

  userAId String
  userBId String

  // マッチング時点のベクトル（スナップショット）
  vectorA String // JSON: [80,60,90,45,70,85]
  vectorB String

  // フィードバック（ユーザーAから見たB）
  fulfillmentScore Int?  // 充足感 (1-10)
  willMeetAgain    Int?  // また会いたい (1-10)
  partnerSeemed    Int?  // 相手は楽しそう (1-10)
  growthPotential  Int?  // 成長できそう (1-10)
  feedbackText     String? // 自由記述

  createdAt DateTime @default(now())

  @@map("interactions")
  @@index([userAId, createdAt(sort: Desc)])
}

model DiagnosticResult {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  answers   String   // JSON
  synthesis String   
  vector    String   // JSON
  createdAt DateTime @default(now())

  @@map("diagnostic_results")
}

`

---

## File: src/lib/gemini.ts

`typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not found. Using mock data.");
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。あなたの入力は非常に詩的で、論理性よりも直感を重視する傾向が見られます。",
            resonance_score: 88,
        };
    }

    // 1. Generate V_display (6-dim) via LLM
    // Sanitize function to prevent simple injection
    const sanitize = (str: string) => str.replace(/`/g, "'").replace(/\$/g, "");
    
    const safeInputs = inputs.map(sanitize);

    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${sanitize(purpose)}"
    * Important: The user is seeking "${sanitize(purpose)}" functionality to maximize their life happiness. 
    * If purpose is "romance", prioritize Empathy and Chemistry cues.
    * If "happiness" (growth), prioritize Determination and Creativity.
    * If "friendship", prioritize Flexibility and Intuition.

    Fragments:
    1. ${safeInputs[0]}
    2. ${safeInputs[1]}
    3. ${safeInputs[2]}

    User Self-Reported Bias (0=Intuition, 100=Logic):
    1. ${biases[0]}
    2. ${biases[1]}
    3. ${biases[2]}
    * Use this bias to weight the "Logic" vs "Intuition" dimensions. High bias > 50 should boost Logic. Low bias < 50 should boost Intuition.

    Dimensions (0-100):
    - Logic (Logic & Structure)
    - Intuition (Insight & Pattern)
    - Empathy (Emotional Resonance)
    - Determination (Willpower & Drive)
    - Creativity (Novelty & Art)
    - Flexibility (Adaptability & Openness)

    Task:
    1. Estimate values (0-100) for each dimension, keeping the User Goal in mind for nuances.
    2. Generate a "Reasoning" summary (Max 100 chars, in JAPANESE) explaining the core personality trait detected in relation to their goal.
    3. Calculate a "Resonance Score" (0-100) representing potential for success in their chosen goal.

    Format: JSON only. Keys: "vector" (array), "reasoning" (string), "resonance_score" (number).
    `;

    try {
        const [result, embeddingResult] = await Promise.all([
            model.generateContent(prompt),
            embeddingModel.embedContent(inputs.join(" ")) // Generate V_essence (High-Dim)
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonStr) as AnalysisResult;

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values // Attach High-Dim Vector
        };
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // Fallback on error
        return {
            vector: [50, 50, 50, 50, 50, 50],
            reasoning: "解析中にエラーが発生しました。",
            resonance_score: 50
        };
    }
}

/** RAG風: ユーザー分析＋相手プロフィールから相性の理由を生成 */
export async function generateMatchReasoning(
    userSynthesis: string,
    partnerName: string,
    partnerBio: string,
    partnerTags: string[],
    similarityPercent: number,
    growthScore: number
): Promise<string> {
    if (!API_KEY) return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%、成長ポテンシャル${growthScore}%です。`;
    const prompt = `
あなたはマッチングアドバイザーです。以下の情報をもとに、なぜこの2人が相性が良いか、50文字以内の日本語で簡潔に説明してください。

【ユーザーの性格分析】
${userSynthesis.slice(0, 500)}

【相性の良い相手】
名前: ${partnerName}
プロフィール: ${partnerBio}
タグ: ${partnerTags.join(", ")}

【数値】
共鳴度: ${similarityPercent}%
成長ポテンシャル: ${growthScore}%

50文字以内で、具体的で温かい推薦理由を1文で出力してください。JSONは不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        return (await result.response).text().trim().slice(0, 120) || `${partnerName}さんとの相性が良いです。`;
    } catch (e) {
        console.warn("Gemini match reasoning error:", e);
        return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%。`;
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
    if (!API_KEY) {
        return {
            delta_vector: [5, -2, 10, 0, 5, 5],
            new_vector: currentVector.map((v, i) => Math.min(100, Math.max(0, v + (i % 2 === 0 ? 5 : -2)))),
            growth_score: 15
        };
    }

    const prompt = `
    User Context Vector: [${currentVector.join(", ")}] (Logic, Intuition, Empathy, Determination, Creativity, Flexibility)
    User Feedback after interaction: "${feedback}"
    Selected Resonance Tags: "${tags.join(", ")}"
    * Tags like "Reassurance" should stabilize vector. "Challenge" should trigger larger delta. "Inspiration" increases Creativity.

    Task:
    1. Analyze the feedback to understand how the user's internal state has changed.
    2. Calculate a "Delta Vector" (6 dims) representing this shift. Positive means growth/increase, negative means decrease.
    3. Calculate the "New Vector" = Current + Delta. Ensure bounds 0-100.
    4. Calculate a "Growth Score" (0-100) based on the magnitude of positive, constructive change.

    Format: JSON only. Keys: "delta_vector" (array), "new_vector" (array), "growth_score" (number).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as DeltaResult;
    } catch (e) {
        console.error("Delta Calc Error", e);
        return {
            delta_vector: [0, 0, 0, 0, 0, 0],
            new_vector: currentVector,
            growth_score: 0
        };
    }
}

/** インタビュー回答から「あなたの変化」サマリーを生成 */
export async function generateReflectionSummary(interviewText: string): Promise<string> {
    if (!API_KEY) return "あなたの振り返りが記録されました。";
    const prompt = `
以下の振り返り回答をもとに、「あなたがどう変わったか」を50文字以内の日本語で要約してください。
温かく、前向きな表現で。

【振り返り】
${interviewText.slice(0, 500)}

50文字以内、1文で。JSON不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        return (await result.response).text().trim().slice(0, 80) || "あなたの振り返りが記録されました。";
    } catch (e) {
        console.warn("Reflection summary error:", e);
        return "あなたの振り返りが記録されました。";
    }
}

`

---

## File: src/lib/crypto.ts

`typescript
import crypto from 'crypto';

// Use a secure key from environment variables or fallback to a hardcoded one for dev (WARNING: Change this in production!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'zax_dev_key_32chars_placeholder!'; 

if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    console.warn("WARNING: ENCRYPTION_KEY is not defined. Using fallback for build.");
}

if (ENCRYPTION_KEY.length !== 32) {
    // console.warn("WARNING: ENCRYPTION_KEY should be 32 characters for AES-256.");
    // We allow it to pass here but the hash below ensures we get a 32-byte key anyway.
}
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // Ensure the key is 32 bytes (256 bits)
    // If the provided key is short, we pad it or hash it. Here we assume it's roughly correct or just hash it to be safe.
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return properly formatted string: IV:EncryptedText
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string using AES-256-CBC
 */
export function decrypt(text: string): string {
    const textParts = text.split(':');
    const ivPart = textParts.shift();
    if (!ivPart) throw new Error("Invalid encrypted text format");
    
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

/**
 * セッションIDをHMAC-SHA256で署名し、改ざん防止する
 * フォーマット: "userId.signature"
 */
export function signSession(userId: string): string {
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);
    return `${userId}.${hmac.digest('hex')}`;
}

/**
 * 署名付きセッションIDを検証し、元のuserIdを返す
 * 署名が無効な場合はnullを返す
 */
export function verifySession(signedSession: string | undefined | null): string | null {
    if (!signedSession) return null;
    const parts = signedSession.split('.');

    if (parts.length !== 2) return null;

    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    hmac.update(userId);

    const expectedSignature = hmac.digest('hex');
    if (expectedSignature.length === signature.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return userId;
    }
    return null;
}

`

---

## File: src/lib/db/client.ts

`typescript
// ZAX Database Client — Prisma + pgvector
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック

let prisma: any;
let vectorStore: any;

// DATABASE_URL が無い場合はモックのみ使用（Vercel等で未設定時）
const useRealDb = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432/dummy")
);

if (!useRealDb) {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "postgresql://localhost:5432/dummy";
    }
}

try {
    if (!useRealDb) throw new Error("Using mock DB");
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number,
            embedding?: number[]
        ) {
            const vectorString = `[${vector.join(",")}]`;
            const embeddingString = embedding ? `[${embedding.join(",")}]` : null;

            if (embeddingString) {
                await prisma.$executeRaw`
                    INSERT INTO "essence_vectors" ("id", "userId", "vector", "embedding", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                    VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${embeddingString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
                `;
            } else {
                await prisma.$executeRaw`
                    INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                    VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
                `;
            }
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            const vectorString = `[${targetVector.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev."vectorJson", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        },
    };

    // DB接続テスト (非同期 — 失敗時はログのみ)
    prisma
        .$queryRaw`SELECT 1`
        .then(() => console.log("✅ PostgreSQL + pgvector 接続成功"))
        .catch((err: any) => console.warn("⚠️ DB接続失敗 (モックにフォールバックはしません):", err.message));
} catch (e: any) {
    console.warn(
        "⚠️ Prisma Client が見つかりません。インメモリ・モックを使用します。",
        e.message
    );

    // In-Memory Mock Store (Prisma未生成時 or ビルド時のフォールバック)
    const mockUsers: any[] = [];
    const mockVectors: any[] = [];
    const mockDiagnostics: any[] = [];

    prisma = {
        user: {
            findUnique: async ({ where }: any) =>
                mockUsers.find(
                    (u) => u.email === where.email || u.id === where.id
                ) || null,
            create: async ({ data }: any) => {
                const newUser = { id: `mock_${Date.now()}`, ...data };
                mockUsers.push(newUser);
                return newUser;
            },
            findFirst: async () => mockUsers[0] || null,
        },
        diagnosticResult: {
            create: async ({ data }: any) => {
                const result = {
                    id: `mock_diag_${Date.now()}`,
                    ...data,
                    createdAt: new Date(),
                };
                mockDiagnostics.push(result);
                return result;
            },
            findUnique: async ({ where }: any) =>
                mockDiagnostics.find((d) => d.id === where.id) || null,
        },
        essenceVector: {
            create: async () => {},
        },
        $executeRaw: async (...args: any[]) =>
            console.log("Mock $executeRaw"),
        $queryRaw: async () => [],
    };

    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number,
            embedding?: number[]
        ) {
            console.log("Mock saveEmbedding:", userId, `[${vector.length}dim]`, embedding ? `[${embedding.length}dim]` : "");
            mockVectors.push({ userId, vector, reasoning, resonanceScore, embedding });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            // モックでも最低限のコサイン類似度検索を実行
            if (mockVectors.length === 0) return [];

            const dot = (a: number[], b: number[]) =>
                a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
            const mag = (a: number[]) =>
                Math.sqrt(a.reduce((s, v) => s + v * v, 0));
            const cosine = (a: number[], b: number[]) => {
                const ma = mag(a);
                const mb = mag(b);
                return ma && mb ? dot(a, b) / (ma * mb) : 0;
            };

            return mockVectors
                .map((mv) => ({
                    id: `mock_vec_${mv.userId}`,
                    userId: mv.userId,
                    vectorJson: JSON.stringify(mv.vector),
                    reasoning: mv.reasoning,
                    resonanceScore: mv.resonanceScore,
                    distance: 1 - cosine(targetVector, mv.vector),
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);
        },
    };
}

export { prisma, vectorStore };

`

---

