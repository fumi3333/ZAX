'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/history/analyze', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Redirect to the same diagnostic result page structure
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        router.push(`/diagnostic/result/${data.id}`);
      } else {
        setError(data.error || '解析に失敗しました。Braveブラウザの履歴が存在するか確認してください。');
      }
    } catch (err) {
      console.error(err);
      setError('通信エラーが発生しました。時間を置いて再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            YOUR HISTORY
          </h1>
          <p className="text-slate-500 text-lg">
            あなたの Brave ブラウザの YouTube 視聴履歴から、<br className="hidden sm:block" />
            深層の興味関心と性格特性をAIが分析します。
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">ブラウザ履歴解析の開始</h2>
            <p className="text-slate-600">
              ※ PC版 Brave ブラウザの閲覧履歴（SQLiteデータベース）を直接読み込みます。別のブラウザを開いている状態でも実行可能です。
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  あなたの履歴を解析中...
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6 mr-3" />
                  無料で履歴解析を開始
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
