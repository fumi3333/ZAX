'use client';

import { useState } from "react";
import BlindChat from '@/components/BlindChat';
import PostChatInterview from '@/components/chat/PostChatInterview';
import ReflectionView from '@/components/chat/ReflectionView';
import { useSearchParams } from 'next/navigation';

type Step = 'chat' | 'interview' | 'reflection';

export default function ChatClient() {
  const searchParams = useSearchParams();
  const partnerName = searchParams.get('partner') || '共鳴する相手';

  const [step, setStep] = useState<Step>('chat');
  const [interviewAnswers, setInterviewAnswers] = useState<{
    aboutPartner: string;
    howChanged: string;
    grew: string;
    togetherFeel: string;
  } | null>(null);
  const [reflectionSummary, setReflectionSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEndChat = () => {
    setStep('interview');
  };

  const handleInterviewSubmit = async (answers: {
    aboutPartner: string;
    howChanged: string;
    grew: string;
    togetherFeel: string;
  }) => {
    setInterviewAnswers(answers);
    setLoading(true);
    setStep('reflection');
    const text = [
      `相手: ${answers.aboutPartner}`,
      `変わった: ${answers.howChanged}`,
      `成長: ${answers.grew}`,
      `一緒にいて: ${answers.togetherFeel}`,
    ].join('\n');
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewText: text }),
      });
      const data = await res.json();
      setReflectionSummary(data.summary || 'あなたの振り返りが記録されました。');
    } catch {
      setReflectionSummary('あなたの振り返りが記録されました。');
    } finally {
      setLoading(false);
      setStep('reflection');
    }
  };

  const handleInterviewSkip = () => {
    setInterviewAnswers({
      aboutPartner: '',
      howChanged: '',
      grew: '',
      togetherFeel: '',
    });
    setReflectionSummary('振り返りをスキップしました。');
    setStep('reflection');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex justify-center items-center">
        {step === 'chat' && (
          <BlindChat partnerName={partnerName} onEndChat={handleEndChat} />
        )}
        {step === 'interview' && (
          <PostChatInterview
            partnerName={partnerName}
            onSubmit={handleInterviewSubmit}
            onSkip={handleInterviewSkip}
          />
        )}
        {step === 'reflection' && (
          loading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600">振り返りを分析中...</p>
            </div>
          ) : interviewAnswers && (
            <ReflectionView
              answers={interviewAnswers}
              summary={reflectionSummary}
              partnerName={partnerName}
            />
          )
        )}
      </div>
    </div>
  );
}
