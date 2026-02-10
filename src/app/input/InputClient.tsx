'use client';

import EssenceInput from '@/components/EssenceInput';
import VectorTransformationVisual from '@/components/VectorTransformationVisual';
import { useRouter } from 'next/navigation';
import { saveAnalysisResult } from '@/lib/actions/manual-auth';

export default function InputClient() {
  const router = useRouter();

  const handleComplete = async (data: any) => {
      console.log("Input Complete:", data);
      
      // Save Mock Analysys Result
      await saveAnalysisResult(data);
      
      // Redirect to Chat
      router.push('/chat');
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
             <h1 className="text-3xl font-bold text-slate-900 mb-2">Resonance Input</h1>
             <p className="text-slate-500">Discover your core vector.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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
