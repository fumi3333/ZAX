# DiagnosticWizard - DiagnosticWizard.tsx
パス: `src/components/diagnostic/DiagnosticWizard.tsx`

## 役割
- 診断質問を1問ずつ表示するウィザードUI
- 全回答完了後、自由記述を受け付けて /api/diagnostic/submit にPOST
- エラー時は「通信エラーが発生しました」のアラートを表示

## コード

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { questions } from '@/data/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useDiagnostic } from '@/context/DiagnosticContext';

export default function DiagnosticWizard() {
  const { answers, currentStep: currentQuestionIndex, setAnswer: contextSetAnswer, setStep: setCurrentQuestionIndex } = useDiagnostic();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isComplete, setIsComplete] = useState(false);
  const [freeText, setFreeText] = useState('');

  // For auto-scroll or focus effects
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const lastQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
  
  const allAnswered = answeredCount >= totalQuestions * 0.8 ||
                      (currentQuestionIndex === totalQuestions - 1 && (lastQuestionAnswered || answeredCount >= totalQuestions * 0.7));

  const handleAnswer = (value: number) => {
    if (currentQuestion) {
       contextSetAnswer(currentQuestion.id, value);
    }
    
    // Auto-advance with a slight delay for visual feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setDirection('next');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection('next');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuestionIndex === totalQuestions - 1 && allAnswered) {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (isComplete) {
        setIsComplete(false);
        return;
    }
    if (currentQuestionIndex > 0) {
      setDirection('prev');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, freeText }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        window.location.href = `/diagnostic/result/${data.id}`;
      } else {
        console.error('Failed to submit:', data.error);
        alert('繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: ' + (data.error || '荳肴・縺ｪ繧ｨ繝ｩ繝ｼ'));
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      alert('騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲ゅヶ繝ｩ繧ｦ繧ｶ縺ｮ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞縲・);
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: 1, label: '蜷梧э縺励↑縺・, color: 'bg-black', size: 'w-16 h-16', border: 'border-black' },
    { value: 2, label: '', color: 'bg-gray-800', size: 'w-12 h-12', border: 'border-gray-800' },
    { value: 3, label: '', color: 'bg-gray-600', size: 'w-8 h-8', border: 'border-gray-600' },
    { value: 4, label: '荳ｭ遶・, color: 'bg-gray-200', size: 'w-6 h-6', border: 'border-gray-300' },
    { value: 5, label: '', color: 'bg-gray-400', size: 'w-8 h-8', border: 'border-gray-400' },
    { value: 6, label: '', color: 'bg-gray-600', size: 'w-12 h-12', border: 'border-gray-600' },
    { value: 7, label: '蜷梧э縺吶ｋ', color: 'bg-black', size: 'w-16 h-16', border: 'border-black' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative">
          <Card 
            ref={cardRef}
            className="border-2 border-black shadow-none rounded-none bg-white"
          >
            <CardContent className="p-8 sm:p-12 text-center space-y-10">
              
              {!isComplete ? (
                <>
                  {currentQuestion && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 key={currentQuestionIndex}">
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
                        雉ｪ蝠・{currentQuestion.id} / {totalQuestions}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-black leading-tight tracking-tight">
                      {currentQuestion.text}
                    </h2>
                  </div>
                  )}

                  <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                    <div className="hidden sm:block text-[10px] font-bold text-gray-400 mr-2">蜷梧э縺励↑縺・/div>
                    
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
                                        ? `bg-black ring-4 ring-offset-2 ring-gray-100 scale-110` 
                                        : `bg-transparent border border-gray-200 hover:bg-black group`
                                    }
                                    ${!isSelected && isAnswered ? 'opacity-40 hover:opacity-100' : 'opacity-100'}
                                `}
                                aria-label={`Select option ${opt.value}`}
                            >
                                {isSelected ? (
                                    <Check className="text-white w-5 h-5 stroke-[3px]" />
                                ) : (
                                    <span className="opacity-0 group-hover:opacity-10 transition-opacity bg-black rounded-full w-full h-full"></span>
                                )}
                            </button>
                        );
                    })}

                    <div className="hidden sm:block text-[10px] font-bold text-gray-400 ml-2">蜷梧э縺吶ｋ</div>
                  </div>

                  <div className="flex sm:hidden justify-between text-[10px] font-bold text-gray-400 px-2">
                    <span>蜷梧э縺励↑縺・/span>
                    <span>蜷梧э縺吶ｋ</span>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 py-6">
                    <h2 className="text-2xl font-black text-black tracking-widest text-center uppercase">險ｺ譁ｭ螳御ｺ・/h2>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto text-center px-4">
                        縺吶∋縺ｦ縺ｮ雉ｪ蝠上∈縺ｮ蝗樒ｭ斐′螳御ｺ・＠縺ｾ縺励◆縲・br/>
                        譛蠕後↓縲√≠縺ｪ縺溘・蝗樒ｭ斐ｒ縺ｩ縺・ｧ｣驥医＠縺ｦ縺ｻ縺励＞縺九↑縺ｩ繧定・逕ｱ縺ｫ謨吶∴縺ｦ縺上□縺輔＞・井ｻｻ諢擾ｼ峨・br/>
                        <span className="text-[10px] text-gray-400">萓具ｼ壹後主━縺励＞蝌倥上↑繧峨▽縺・※繧ゅ＞縺・→諤昴≧縲阪御ｻ穂ｺ九ｈ繧雁ｹｳ遨上ｒ蜆ｪ蜈医＠縺溘＞縲阪↑縺ｩ</span>
                    </p>
                    <div className="px-4">
                        <textarea
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                            placeholder="萓具ｼ壼屓遲斐↓縺ｯ縲∬ｫ也炊繧医ｊ繧よ─諠・ｒ螟ｧ蛻・↓縺励◆縺・→縺・≧諢丞峙縺悟性縺ｾ繧後※縺・∪縺・.."
                            className="text-black w-full h-32 p-4 text-sm border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all resize-none placeholder:text-gray-300"
                        />
                        <p className="text-[9px] text-gray-400 mt-2 text-right">窶ｻ蜈･蜉帙☆繧九→AI縺ｫ繧医ｋ蛻・梵縺後ｈ繧願ｩｳ邏ｰ縺ｫ縺ｪ繧翫∪縺・/p>
                    </div>
                </div>
              )}

            </CardContent>
          </Card>
      </div>

      <div className="mt-12 flex justify-between items-center px-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && !isComplete}
          className="text-gray-400 hover:text-black hover:bg-transparent transition-colors text-[10px] font-bold"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          謌ｻ繧・        </Button>

        {!isComplete ? (
            currentQuestionIndex === totalQuestions - 1 ? (
                 <Button 
                    onClick={() => setIsComplete(true)} 
                    disabled={!allAnswered}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-none font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-20"
                 >
                    螳御ｺ・                 </Button>
            ) : (
                <div className="text-[10px] font-bold text-gray-300">
                    騾ｲ謐・ {Math.round((answeredCount / totalQuestions) * 100)}%
                </div>
            )
        ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-gray-800 px-10 py-7 rounded-none font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-20 translate-y-[-10px] border-2 border-black"
             >
                {isSubmitting ? '蛻・梵荳ｭ...' : '邨先棡繧定ｦ九ｋ'}
             </Button>
        )}
      </div>
    </div>
  );
}

```
