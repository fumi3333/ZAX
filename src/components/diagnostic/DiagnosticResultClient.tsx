"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
const DIMENSION_LABELS = ["生活基盤", "社会意識", "信頼構築", "対話力", "野心", "寛容性"];
import ResultRadarChart from "./ResultRadarChart";

import Link from "next/link";
import { ArrowRight, Sparkles, Loader2, BookOpen, ExternalLink, Copy, CheckCircle2, Mail } from "lucide-react";

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

  // Email-only registration state
  const [email, setEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  // Copy State
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!data) return;
    const url = `${window.location.origin}/diagnostic/result/${data.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("有効なメールアドレスを入力してください");
      return;
    }
    setEmailError(null);
    setIsSavingEmail(true);
    try {
      const res = await fetch("/api/auth/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resultId: data?.id }),
      });
      const json = await res.json();
      if (json.success) {
        setEmailSaved(true);
      } else {
        setEmailError(json.error || "登録に失敗しました");
      }
    } catch {
      setEmailError("通信エラーが発生しました");
    } finally {
      setIsSavingEmail(false);
    }
  };



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



  if (loading && !isGenerating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            もう一度診断する
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

          {/* Share Button for External Users */}
          <div className="mt-10 flex flex-col items-center justify-center space-y-3 border-t border-slate-100 pt-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share Your ZAX Vector</p>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
                copied 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-transparent text-slate-900 border-slate-900 hover:bg-slate-50'
              }`}
            >
              {copied ? (
                <><CheckCircle2 className="w-4 h-4" />コピー完了</>
              ) : (
                <><Copy className="w-4 h-4" />診断結果URLをコピー</>
              )}
            </button>
          </div>
        </section>

        {/* 4. Full Report Display (For All Users) */}
        {!isGenerating && (
          <section className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
              <BookOpen className="w-8 h-8 text-slate-900" />
              分析レポート
            </h2>
            
            <div className="space-y-6 text-base md:text-lg leading-loose text-slate-700 font-medium">
              {data.synthesis.includes("登録後にAI詳細分析レポートが生成されます") || data.synthesis.includes("分析エラーが発") ? (
                 <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl flex flex-col items-center text-center space-y-4">
                    <p className="text-slate-600 font-bold">レポートデータがまだ生成されていないか、エラーが発生しました。</p>
                    <button 
                       onClick={async () => {
                         setIsGenerating(true);
                         try {
                           const res = await fetch("/api/diagnostic/generate-report", {
                             method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resultId: data.id })
                           });
                           const d = await res.json();
                           if (d.success) {
                              setData({...data, synthesis: d.synthesis});
                              sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify({...data, synthesis: d.synthesis}));
                           } else {
                              alert("生成に失敗しました。時間をおいてお試しください。");
                           }
                         } finally { setIsGenerating(false); }
                       }}
                       className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-md hover:shadow-lg transition-all"
                    >
                       レポートを再生成する
                    </button>
                 </div>
              ) : (
                synthesisParagraphs.map((para: string, i: number) => (
                  <p key={i} className="text-left">{para}</p>
                ))
              )}
            </div>

            {/* Email Registration CTA — Save history & report */}
            <div className="mt-16 pt-12 border-t border-slate-100">
              {emailSaved ? (
                <div className="text-center space-y-3 py-4">
                  <CheckCircle2 className="w-10 h-10 text-slate-900 mx-auto" />
                  <p className="text-xl font-black text-slate-900">登録しました</p>
                  <p className="text-slate-500 text-sm">次回の診断から、あなたの変遷が記録されます。</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Save & Track</span>
                    <h3 className="text-2xl font-black text-slate-900">このレポートを保存する</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                      メールアドレスを登録すると、診断の変遷を記録し、次回以降のレポートと比較できるようになります。
                    </p>
                  </div>
                  <form onSubmit={handleSaveEmail} className="max-w-sm mx-auto flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none text-sm font-medium transition-colors"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSavingEmail}
                        className="px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSavingEmail ? "保存中..." : "保存"}
                      </button>
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-xs font-bold text-center">{emailError}</p>
                    )}
                    <p className="text-center text-xs text-slate-400">大学メール以外でもOK。パスワード不要。</p>
                  </form>
                </div>
              )}
            </div>
          </section>
        )}



        <section className="text-center pt-8">
          <Link
            href="/diagnostic"
            className="text-slate-400 text-sm font-bold hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            やり直す
          </Link>
        </section>
      </main>
    </div>
  );
}
