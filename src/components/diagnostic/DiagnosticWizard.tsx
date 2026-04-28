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
  // Gemini API送信に対する同意フラグ（個人情報保護法 第21条対応）
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. 初回ロード: localStorageからデータを復旧
  useEffect(() => {
    const saved = localStorage.getItem('zax_diagnostic_draft');
    if (saved) {
      try {
        const { answers: sAnswers, freetext: sFreetext, index: sIndex } = JSON.parse(saved);
        if (sAnswers) setAnswers(sAnswers);
        if (sFreetext) setFreetext(sFreetext);
        if (typeof sIndex === 'number') setCurrentQuestionIndex(sIndex);
      } catch (e) {
        console.warn('Failed to parse diagnostic draft:', e);
      }
    }
  }, []);

  // 2. 変更時に自動保存
  useEffect(() => {
    const data = { answers, freetext, index: currentQuestionIndex };
    localStorage.setItem('zax_diagnostic_draft', JSON.stringify(data));
  }, [answers, freetext, currentQuestionIndex]);

  const totalQuestions = questions.length;
  const isFinalStep = currentQuestionIndex === totalQuestions;
  const currentQuestion = !isFinalStep ? questions[currentQuestionIndex] : null;
  
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions && freetext.trim().length > 5;

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    
    // 連打による複数回スキップを防止
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Auto-advance
    timeoutRef.current = setTimeout(() => {
      setDirection('next');
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions));
    }, 300);
  };

  const handleJumpToUnanswered = () => {
    const firstUnansweredIndex = questions.findIndex(q => answers[q.id] === undefined);
    if (firstUnansweredIndex !== -1) {
      setDirection('prev');
      setCurrentQuestionIndex(firstUnansweredIndex);
    }
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
        localStorage.removeItem('zax_diagnostic_draft'); // 成功したら下書きを消去
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

      {/* 同意画面: 未同意の場合は診断を開始できない */}
      {!hasConsented ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 space-y-6">
          <div className="space-y-2 text-center">
            <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">プライバシーについて</span>
            <h2 className="text-2xl font-bold text-slate-900">診断を開始する前に</h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 leading-relaxed space-y-3">
            <p>本診断における回答内容および自由記述は、性格特性の分析のために<strong className="text-slate-800">Google Gemini API</strong>に送信されます。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>APIに送信されるデータは分析目的のみに使用します。</li>
              <li>メールアドレスはハッシュ化され、特定に使えない形式でのみ保管します。</li>
              <li>詳細は<a href="/privacy" className="text-indigo-600 underline" target="_blank">プライバシーポリシー</a>をご確認ください。</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              上記の内容を理解し、<strong>Gemini APIへの回答データの送信</strong>に同意します。
            </span>
          </label>

          <button
            onClick={() => { if (consentChecked) setHasConsented(true); }}
            disabled={!consentChecked}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            同意して診断を始める
          </button>
        </div>
      ) : (
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
                  {answeredCount < totalQuestions ? (
                    <div className="flex flex-col items-center gap-2 mt-4 p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-bold">
                        ⚠️ 未回答の質問が {totalQuestions - answeredCount} 問あります
                      </p>
                      <Button variant="outline" onClick={handleJumpToUnanswered} className="text-red-500 border-red-200 hover:bg-red-100">
                        未回答の質問に戻る
                      </Button>
                    </div>
                  ) : !allAnswered ? (
                    <p className="text-xs text-amber-500 font-bold">分析を開始するには、自由記述を入力してください（5文字以上）。</p>
                  ) : null}
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
      )} {/* hasConsented の三項演算子の閉じ */}
    </div>
  );
}
