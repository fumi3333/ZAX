"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import MatchResults from "./MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2, BookOpen, ExternalLink } from "lucide-react";

interface ResultData {
  id: string;
  isGuest: boolean;
  synthesis: string;
  answers: Record<string, number>;
  vector?: number[] | string;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    // When updating from guest to real, we might need fresh data from server, 
    // so we always fetch to be safe if not generating right now.
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => {
          if (cached) {
            setData(JSON.parse(cached));
          } else {
            setError("結果の取得に失敗しました。もう一度診断をお試しください。");
          }
      })
      .finally(() => setLoading(false));
  }, [resultId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);

    try {
      // 1. Convert guest to real user
      const regRes = await fetch("/api/auth/guest-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const regData = await regRes.json();

      if (!regData.success) {
        setRegError(regData.error || "登録に失敗しました。");
        setIsRegistering(false);
        return;
      }

      // 2. Registration Success, immediately start generating long report
      setIsRegistering(false);
      setIsGenerating(true);

      const genRes = await fetch("/api/diagnostic/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: data?.id }),
      });
      const genData = await genRes.json();

      if (genData.success && data) {
         // Update UI
         setData({
             ...data,
             isGuest: false,
             synthesis: genData.synthesis
         });
         // Update cache
         sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify({
            ...data,
            isGuest: false,
            synthesis: genData.synthesis
         }));
      } else {
         setRegError("レポートの生成に失敗しました。ページをリロードしてください。");
      }
    } catch (err) {
      setRegError("通信エラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && !isGenerating) {
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
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            履歴から再解析する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Determine vector
  let userVector6d: number[] = [50, 50, 50, 50, 50, 50];
  if (data.vector && Array.isArray(data.vector)) {
    userVector6d = data.vector;
  } else if (data.vector && typeof data.vector === 'string') {
    try {
        userVector6d = JSON.parse(data.vector);
    } catch {
        console.warn("Failed to parse vector string");
    }
  }

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = (data.synthesis || "")
    .split("\n")
    .filter((p: string) => p.trim() !== "");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            分析結果
          </h1>
        </section>

        {/* 1. Radar Chart Section */}
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

        {/* 2. Registration Wall for Guests */}
        {data.isGuest && !isGenerating && (
          <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
             <div className="max-w-md mx-auto relative z-10 text-center space-y-6">
                <div className="inline-block p-4 rounded-full bg-slate-800 mb-2">
                  <BookOpen className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">深層心理レポート</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  ここから先は、あなたの価値観と行動特性を深く掘り下げる約3,000文字の「深層パーソナリティレポート」をご用意しています。閲覧および保存には無料のアカウント登録が必要です。
                </p>

                <form onSubmit={handleRegister} className="mt-8 space-y-4 text-left">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                     {regError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg font-bold">
                           {regError}
                        </div>
                     )}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">ニックネーム (学内表示用)</label>
                       <input 
                          type="text" 
                          required
                          value={nickname}
                          onChange={e => setNickname(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="ZAX 太郎"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">大学メールアドレス</label>
                       <input 
                          type="email" 
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="name@musashino-u.ac.jp"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 mb-1">パスワード</label>
                       <input 
                          type="password" 
                          required
                          minLength={6}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="6文字以上"
                       />
                     </div>
                     <button 
                        type="submit" 
                        disabled={isRegistering}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 mt-4"
                     >
                        {isRegistering ? (
                          <><Loader2 className="w-5 h-5 animate-spin" />登録処理中...</>
                        ) : (
                          <>無料で登録してレポートを見る<ArrowRight className="w-5 h-5" /></>
                        )}
                     </button>
                  </div>
                </form>
             </div>
             {/* Decor */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
          </section>
        )}

        {/* 3. Generating Report State */}
        {isGenerating && (
          <section className="bg-slate-900 text-white rounded-2xl p-12 md:p-20 shadow-2xl text-center space-y-8 border border-slate-800">
             <div className="inline-block p-6 rounded-full bg-indigo-900/30 border border-indigo-500/20 mb-4 relative">
                <Loader2 className="w-16 h-16 text-indigo-400 animate-spin absolute inset-0 m-auto" />
                <Sparkles className="w-8 h-8 text-indigo-300 opacity-50 absolute -top-2 -right-2 animate-pulse" />
             </div>
             <h3 className="text-2xl font-bold text-white">深層心理レポートを生成中...</h3>
             <div className="max-w-md mx-auto text-slate-400 text-sm space-y-2 font-medium">
               <p>あなたの履歴ベクトルデータから、約3,000文字に及ぶ詳細な専門的心理分析レポートを執筆しています。</p>
               <p className="opacity-70 text-xs">※データの複雑さにより数十秒かかる場合があります。この画面のままお待ちください。</p>
             </div>
          </section>
        )}

        {/* 4. Full Report Display (For Logged In / Newly Registered Users) */}
        {!data.isGuest && !isGenerating && (
          <section className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              深層パーソナリティレポート
            </h2>
            
            <div className="space-y-6 text-base md:text-lg leading-loose text-slate-700 font-medium">
              {synthesisParagraphs.map((para: string, i: number) => (
                <p key={i} className="text-left">{para}</p>
              ))}
            </div>

            {/* ZAXcampus CTA - At the bottom of the long report */}
            <div className="mt-16 pt-12 border-t border-slate-100 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                   <span className="font-black text-2xl">Z</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">さらなる出会いと挑戦へ</h3>
                <p className="text-slate-500 max-w-lg mx-auto font-medium">
                  ZAXcampusに登録して、学内の新しいプロジェクトや価値観の合う仲間を探しに行きましょう。
                </p>
                <a 
                   href="https://zax-campus.com" // Placeholder external link
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold text-lg hover:from-black hover:to-black transition-all shadow-xl hover:-translate-y-1 mx-auto"
                >
                   ZAXcampusを始める
                   <ExternalLink className="w-5 h-5 text-indigo-300" />
                </a>
            </div>
          </section>
        )}

        {/* 5. Match Results Section (Optional, keeping it below if they want to chat in the current app, but users flow ends at ZAXcampus) */}
        {!data.isGuest && !isGenerating && (
           <MatchResults userVector={userVector6d} synthesis={data.synthesis} isGuest={data.isGuest} />
        )}

        <section className="text-center pt-8">
          <Link
            href="/history"
            className="text-slate-400 text-sm font-bold hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            やり直す
          </Link>
        </section>
      </main>
    </div>
  );
}
