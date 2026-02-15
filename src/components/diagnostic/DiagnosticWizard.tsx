'use client';

import { useState, useRef, useEffect } from 'react';
import { questions } from '@/data/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function DiagnosticWizard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // For auto-scroll or focus effects
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const allAnswered = answeredCount >= totalQuestions * 0.8 || 
                      (currentQuestionIndex === totalQuestions - 1 && answeredCount >= totalQuestions * 0.7);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance with a slight delay for visual feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setDirection('next');
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 300);
    } else {
        // Scroll to submit button or highlight it if it's the last question
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
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
    setIsSubmitting(true);
    try {
      console.log('Submitting diagnostic with answers:', answers);
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        console.log('Redirecting to:', `/diagnostic/result/${data.id}`);
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

  // 1-7 Scale Configuration
  // 1: Big Disagree, 2: Med Disagree, 3: Small Disagree, 4: Neutral, 5: Small Agree, 6: Med Agree, 7: Big Agree
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
      {/* Progress Bar */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500 tracking-wider">
          <span>PROGRESS</span>
          <span>{answeredCount} / {totalQuestions} 回答済み</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative perspective-1000">
          <Card 
            ref={cardRef}
            className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500"
          >
            <CardContent className="p-8 sm:p-12 text-center space-y-10">
              
              {/* Question Text */}
              {currentQuestion && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 key={currentQuestionIndex}">
                <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                    質問 {currentQuestion.id} / {totalQuestions}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>
              )}

              {/* Options (Bubbles) */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                <div className="hidden sm:block text-xs font-bold text-red-500/80 mr-2">同意しない</div>
                
                    {options.map((opt) => {
                    const isSelected = currentQuestion && answers[currentQuestion.id] === opt.value;
                    const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
                    
                    return (
                        <button
                            key={opt.value}
                            onClick={() => currentQuestion && handleAnswer(opt.value)}
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

              {/* Mobile Labels */}
              <div className="flex sm:hidden justify-between text-xs font-bold text-slate-400 px-2">
                <span className="text-red-500">同意しない</span>
                <span className="text-green-600">同意する</span>
              </div>

            </CardContent>
          </Card>
      </div>

      {/* Navigation Buttons */}
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

        {currentQuestionIndex === totalQuestions - 1 && (
             <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !allAnswered}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSubmitting ? '分析中...' : '診断結果を見る'}
             </Button>
        )}
        
        {currentQuestionIndex < totalQuestions - 1 && (
            <div className="text-xs text-slate-300">
                回答すると自動で進みます
            </div>
        )}
      </div>
    </div>
  );
}
