"use client";

import { useEffect, useState } from "react";
const DIMENSION_LABELS = ["生活基盤", "社会意識", "信頼構築", "対話力", "野心", "寛容性"];
import ResultRadarChart from "./ResultRadarChart";
import Link from "next/link";
import { Loader2, BookOpen, Copy, CheckCircle2, Mail, GraduationCap, Users } from "lucide-react";

interface ResultData {
  id: string;
  isGuest: boolean;
  synthesis: string;
  answers: Record<string, number>;
  vector?: number[] | string;
}

interface StructuredReport {
  otsuge: string;
  machihito: string;
  koudou: string;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

function parseReport(synthesis: string): StructuredReport | null {
  if (!synthesis) return null;
  try {
    const parsed = JSON.parse(synthesis);
    if (parsed.otsuge && parsed.machihito && parsed.koudou) return parsed as StructuredReport;
  } catch { /* not JSON */ }
  return null;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [campusEmail, setCampusEmail] = useState("");
  const [campusError, setCampusError] = useState<string | null>(null);
  const [campusRegistered, setCampusRegistered] = useState(false);
  const [generalRegistered, setGeneralRegistered] = useState(false);
  const [isMatchRegistering, setIsMatchRegistering] = useState<'campus' | 'general' | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
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
        const needsGeneration = !data?.synthesis ||
          data.synthesis.includes("分析エラー") ||
          data.synthesis.includes("分析中") ||
          data.synthesis.trim() === "";
        if (needsGeneration && data?.id) {
          setIsGenerating(true);
          try {
            const rRes = await fetch("/api/diagnostic/generate-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resultId: data.id }),
            });
            const rData = await rRes.json();
            if (rData.success && rData.synthesis) {
              setData(prev => prev ? { ...prev, synthesis: rData.synthesis } : prev);
            }
          } catch { /* silent fail */ }
          finally { setIsGenerating(false); }
        }
      } else {
        setEmailError(json.error || "登録に失敗しました");
      }
    } catch {
      setEmailError("通信エラーが発生しました");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleCampusMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusEmail.includes('@')) {
      setCampusError('大学のメールアドレスを入力してください');
      return;
    }
    setCampusError(null);
    setIsMatchRegistering('campus');
    try {
      const res = await fetch("/api/match/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: campusEmail, type: 'campus', resultId: data?.id }),
      });
      const json = await res.json();
      if (json.success) setCampusRegistered(true);
      else setCampusError(json.error || "登録に失敗しました");
    } catch {
      setCampusError("通信エラーが発生しました");
    } finally {
      setIsMatchRegistering(null);
    }
  };

  const handleGeneralMatch = async () => {
    setIsMatchRegistering('general');
    try {
      const res = await fetch("/api/match/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: 'general', resultId: data?.id }),
      });
      const json = await res.json();
      if (json.success) setGeneralRegistered(true);
    } catch { /* silently fail */ }
    finally { setIsMatchRegistering(null); }
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
      if (d.success) {
        setData({ ...data, synthesis: d.synthesis });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => setError("結果の取得に失敗しました。もう一度診断をお試しください。"))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">分析中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <p className="text-slate-600">{error || "結果が見つかりませんでした"}</p>
          <Link href="/diagnostic" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">
            もう一度診断する
          </Link>
        </div>
      </div>
    );
  }

  // Parse vector
  let userVector6d: number[] = [50, 50, 50, 50, 50, 50];
  if (data.vector && Array.isArray(data.vector)) {
    userVector6d = data.vector;
  } else if (data.vector && typeof data.vector === "string") {
    try { userVector6d = JSON.parse(data.vector); } catch { /* use default */ }
  }

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const structuredReport = parseReport(data.synthesis || "");
  const hasValidSynthesis = !!structuredReport || (
    data.synthesis &&
    !data.synthesis.includes("分析エラー") &&
    data.synthesis.trim().length > 10
  );

  // Fallback plain-text paragraphs (for legacy/non-JSON synthesis)
  const plainParagraphs = (!structuredReport && data.synthesis)
    ? data.synthesis.split("\n").filter((p: string) => p.trim() !== "")
    : [];

  const omikujiCards = structuredReport ? [
    { label: "御告げ", emoji: "⛩", text: structuredReport.otsuge },
    { label: "待ち人", emoji: "🌙", text: structuredReport.machihito },
    { label: "学問・行動", emoji: "🔥", text: structuredReport.koudou },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ヘッダー */}
        <section className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">分析結果</h1>
          <p className="text-slate-400 text-sm">6次元ベクトルによる価値観マッピング</p>
        </section>

        {/* レーダーチャート */}
        <section className="bg-white rounded-2xl p-5 sm:p-8 shadow border border-slate-200">
          <h2 className="text-xs font-bold mb-6 text-center text-slate-400 uppercase tracking-widest">特性ベクトル</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm">
              <ResultRadarChart data={chartData} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {chartData.map((item) => (
              <div key={item.subject} className="p-2 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 font-bold mb-1">{item.subject}</div>
                <div className="text-xl font-black text-slate-900">{item.A}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center border-t border-slate-100 pt-5">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2 ${
                copied ? "bg-slate-900 text-white border-slate-900" : "bg-transparent text-slate-900 border-slate-900 hover:bg-slate-50"
              }`}
            >
              {copied ? <><CheckCircle2 className="w-4 h-4" />コピー完了</> : <><Copy className="w-4 h-4" />結果URLをコピー</>}
            </button>
          </div>
        </section>

        {/* ─── メール登録ゲート ─── */}
        {!emailSaved ? (
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow border border-slate-200 text-center space-y-6">
            <div className="space-y-3">
              <div className="text-4xl">⛩</div>
              <h3 className="text-xl font-black text-slate-900">おみくじを引く</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                メールアドレスを登録すると、あなた専用のAI御告げが解禁されます。
              </p>
            </div>
            <form onSubmit={handleSaveEmail} className="flex flex-col gap-3 max-w-sm mx-auto w-full">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-medium transition-colors bg-white"
                  required
                />
              </div>
              {emailError && <p className="text-red-500 text-xs font-bold">{emailError}</p>}
              <button
                type="submit"
                disabled={isSavingEmail}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
              >
                {isSavingEmail ? "登録中..." : "御告げを受け取る →"}
              </button>
              <p className="text-xs text-slate-400">大学メール以外でもOK。パスワード不要。</p>
            </form>
          </section>
        ) : (
          <>
            {/* ─── おみくじカード（3枚） ─── */}
            {isGenerating ? (
              <section className="bg-white rounded-2xl p-10 shadow border border-slate-200 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <p className="text-slate-500 font-medium text-sm">御告げを生成中...</p>
              </section>
            ) : hasValidSynthesis && omikujiCards.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-xs font-bold text-center text-slate-400 uppercase tracking-widest">デジタルおみくじ</h2>
                {omikujiCards.map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl p-6 shadow border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{card.emoji}</span>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                    </div>
                    <p className="text-slate-700 text-base leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </section>
            ) : hasValidSynthesis && plainParagraphs.length > 0 ? (
              /* 旧フォーマット（プレーンテキスト）フォールバック */
              <section className="bg-white rounded-2xl p-6 sm:p-8 shadow border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="text-2xl">⛩</span>
                  <h2 className="text-xl font-black text-slate-900">御告げ</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed text-slate-700">
                  {plainParagraphs.map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-2xl p-8 shadow border border-slate-200 flex flex-col items-center gap-4">
                <p className="text-slate-500 font-medium text-sm">御告げの生成中にエラーが発生しました。</p>
                <button onClick={handleRegenerate} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">
                  もう一度引き直す
                </button>
              </section>
            )}

            {/* ─── 詳細レポートリンク（保存完了通知）─── */}
            <section className="text-center py-2">
              <p className="text-xs text-slate-400">
                このレポートは保存されました。
                <a href="/mypage" className="text-slate-900 font-bold underline ml-1">マイページ</a>
                からいつでも見返せます。
              </p>
            </section>

            {/* ─── マッチング登録 ─── */}
            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900">マッチングに参加する</h2>
              </div>

              {/* キャンパスマッチ */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">キャンパスマッチ</h3>
                    <p className="text-xs text-slate-400">武蔵野大学生限定</p>
                  </div>
                </div>
                {campusRegistered ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
                    <p className="text-sm font-bold text-slate-700">キャンパスマッチに登録しました</p>
                  </div>
                ) : (
                  <form onSubmit={handleCampusMatch} className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="@stu.musashino-u.ac.jp"
                        value={campusEmail}
                        onChange={(e) => setCampusEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-medium transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isMatchRegistering === 'campus'}
                      className="px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {isMatchRegistering === 'campus' ? '...' : '参加'}
                    </button>
                  </form>
                )}
                {campusError && <p className="text-red-500 text-xs font-bold mt-2">{campusError}</p>}
              </div>

              {/* 通常マッチ */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">通常マッチ</h3>
                    <p className="text-xs text-slate-400">誰でも参加可能</p>
                  </div>
                </div>
                {generalRegistered ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
                    <p className="text-sm font-bold text-slate-700">通常マッチに登録しました</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">
                      登録済みのメール（<span className="font-bold text-slate-700">{email}</span>）で参加します。
                    </p>
                    <button
                      onClick={handleGeneralMatch}
                      disabled={isMatchRegistering === 'general'}
                      className="w-full py-3 border-2 border-slate-900 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isMatchRegistering === 'general' ? '登録中...' : '通常マッチに参加する'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* やり直す */}
        <section className="text-center pt-4">
          <Link href="/diagnostic" className="text-slate-400 text-sm font-bold hover:text-slate-900 transition-colors uppercase tracking-widest">
            やり直す
          </Link>
        </section>
      </main>
    </div>
  );
}
