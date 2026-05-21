"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Copy, CheckCircle2, Mail } from "lucide-react";

import { useDiagnosticResult } from "@/features/diagnostic/hooks/useDiagnosticResult";
import { parseReport, sanitizeText } from "@/features/diagnostic/utils/parseReport";
import { DIMENSION_LABELS, OMIKUJI_SECTIONS } from "@/features/diagnostic/types";
import MatchRegistrationForm from "@/features/match/components/MatchRegistrationForm";
import ResultRadarChart from "./ResultRadarChart";

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const { data, setData, loading, error } = useDiagnosticResult(resultId);

  const [email,        setEmail]        = useState("");
  const [isSaving,     setIsSaving]     = useState(false);
  const [emailSaved,   setEmailSaved]   = useState(false);
  const [emailError,   setEmailError]   = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied,       setCopied]       = useState(false);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${window.location.origin}/diagnostic/result/${data.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("有効なメールアドレスを入力してください"); return; }
    setEmailError(null);
    setIsSaving(true);
    try {
      const res  = await fetch("/api/auth/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resultId: data?.id }),
      });
      const json = await res.json();
      if (json?.success) setEmailSaved(true);
      else setEmailError(json?.error || "登録に失敗しました");
    } catch {
      setEmailError("通信エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/diagnostic/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: data.id }),
      });
      const d = await res.json();
      if (d?.success && d.synthesis) setData({ ...data, synthesis: d.synthesis });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs tracking-widest uppercase font-semibold">分析中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center space-y-6 max-w-sm">
          <p className="text-slate-600 text-sm">{error || "結果が見つかりませんでした"}</p>
          <Link href="/diagnostic" className="inline-block px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg">
            もう一度診断する
          </Link>
        </div>
      </div>
    );
  }

  let userVector6d: number[] = [50, 50, 50, 50, 50, 50];
  if (Array.isArray(data.vector)) {
    userVector6d = data.vector;
  } else if (typeof data.vector === "string") {
    try { const p = JSON.parse(data.vector); if (Array.isArray(p)) userVector6d = p; } catch { /* fallback */ }
  }

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label, A: userVector6d[i] ?? 50, fullMark: 100,
  }));

  const report = data.synthesis ? parseReport(data.synthesis) : null;
  const hasValidSynthesis = !!report || (!!data.synthesis && !data.synthesis.includes("分析エラー") && data.synthesis.trim().length > 10);
  const plainParagraphs = (!report && data.synthesis)
    ? data.synthesis.split("\n").map((p: string) => sanitizeText(p)).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <div className="h-14" />

      <main className="w-full max-w-xl mx-auto px-4 py-8 space-y-8">

        <header className="text-center">
          <h1 className="text-2xl font-black tracking-tight">分析結果</h1>
        </header>

        <section className="border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-5 overflow-hidden">
          <ResultRadarChart data={chartData} />
          <div className="grid grid-cols-3 gap-2">
            {chartData.map((item) => (
              <div key={item.subject} className="text-center py-2 px-1 bg-slate-50 rounded-lg">
                <div className="text-[10px] text-slate-400 font-bold mb-0.5">{item.subject}</div>
                <div className="text-lg font-black text-slate-900">{item.A}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-1 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                copied ? "bg-slate-900 text-white border-slate-900" : "text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {copied ? <><CheckCircle2 className="w-3.5 h-3.5" />コピー完了</> : <><Copy className="w-3.5 h-3.5" />URLをコピー</>}
            </button>
          </div>
        </section>

        {!emailSaved ? (
          <section className="border border-slate-100 rounded-2xl p-6 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black">分析レポートを見る</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                メールアドレスを登録すると、あなた専用の深い本質分析と行動指針が解禁されます。
              </p>
            </div>
            <form onSubmit={handleSaveEmail} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm transition-colors bg-white"
                  required
                />
              </div>
              {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isSaving ? "分析中..." : "分析レポートを見る"}
              </button>
              <p className="text-center text-xs text-slate-400">パスワード不要。大学メール以外でもOK。</p>
            </form>
          </section>
        ) : (
          <>
            {isGenerating ? (
              <section className="border border-slate-100 rounded-2xl p-10 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                <p className="text-slate-400 text-xs tracking-widest uppercase">分析中...</p>
              </section>
            ) : report ? (
              <section className="space-y-3">
                {OMIKUJI_SECTIONS.map((sec, idx) => (
                  <div key={sec.key} className="border border-slate-100 rounded-2xl p-5 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-black text-slate-900">{sec.label}</span>
                      <span className="text-[10px] text-slate-400">{sec.sub}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed pl-6">{report[sec.key]}</p>
                  </div>
                ))}
              </section>
            ) : hasValidSynthesis && plainParagraphs.length > 0 ? (
              <section className="border border-slate-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">おみくじ結果</p>
                {plainParagraphs.map((para: string, i: number) => (
                  <p key={i} className="text-slate-700 text-sm leading-relaxed">{para}</p>
                ))}
              </section>
            ) : (
              <section className="border border-slate-100 rounded-2xl p-8 flex flex-col items-center gap-4">
                <p className="text-slate-400 text-sm">生成に失敗しました</p>
                <button onClick={handleRegenerate} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">
                  もう一度引き直す
                </button>
              </section>
            )}

            <p className="text-center text-xs text-slate-400">
              このレポートは保存されました。
              <a href="/mypage" className="text-slate-900 font-bold underline ml-1">マイページ</a>
              からいつでも確認できます。
            </p>

            <MatchRegistrationForm resultId={data.id} email={email} />
          </>
        )}

        <div className="text-center pb-8">
          <Link href="/diagnostic" className="text-xs text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest transition-colors">
            やり直す
          </Link>
        </div>
      </main>
    </div>
  );
}
