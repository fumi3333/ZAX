'use client';

import { useState } from 'react';
import EssenceInput, { EssenceInputData } from '@/components/EssenceInput';
import VectorTransformationVisual from '@/components/VectorTransformationVisual';
import { useRouter } from 'next/navigation';

export default function InputClient() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: EssenceInputData) => {
    const inputs = data.fragments.filter((f) => f.trim());
    if (inputs.length === 0) {
      setError('少なくとも1つ以上の入力が必要です');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          biases: data.biases,
          purpose: data.purpose || 'general',
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '分析に失敗しました');
      }

      router.push('/chat');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
             <h1 className="text-3xl font-bold text-slate-900 mb-2">Resonance Input</h1>
             <p className="text-slate-500">Discover your core vector.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                {analyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-slate-600 font-medium">分析中...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <EssenceInput onComplete={handleComplete} />
            </div>
            
            <div className="hidden md:block sticky top-20">
                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl aspect-square flex items-center justify-center overflow-hidden relative">
                    <VectorTransformationVisual />
                    <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono">
                        VECTOR_SPACE_VISUALIZER // LISTENING
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
}
