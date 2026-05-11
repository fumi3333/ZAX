"use client";

import { useEffect, useState } from "react";
const DIMENSION_LABELS = ["生活基盤", "社会意識", "信頼構築", "対話力", "野心", "寛容性"];
import ResultRadarChart from "./ResultRadarChart";
import Link from "next/link";
import { Loader2, Copy, CheckCircle2, Mail, GraduationCap, Users } from "lucide-react";

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

const OMIKUJI_SECTIONS = [
  { key: "otsuge" as const,   label: "御告げ",    sub: "総評" },
  { key: "machihito" as const, label: "待ち人",    sub: "出会うべき相手" },
  { key: "koudou" as const,   label: "学問・行動", sub: "今のあなたへ" },
];

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
          } catch { /* silent */ }
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
    } catch { /* silent */ }
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
      if (d.success) setData({ ...data, synthesis: d.synthesis });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetch(`/api/diagnostic/result/${resultId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(json => setData(json))
      .catch(() => setError("結果の取得に失敗しました。もう一度診断をお試しください。"))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm tracking-widest uppercase">分析中</p>
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

  const report = parseReport(data.synthesis || "");
  const hasValidSynthesis = !!report || (
    !!data.synthesis && !data.synthesis.includes("分析エラー") && data.synthesis.trim().length > 10
  );
  const plainParagraphs = !report && data.synthesis
    ? data.synthesis.split("\n").filter((p: string) => p.trim())
    : [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="h-14" />

      <main className="w-full max-w-xl mx-auto px-4 py-10 space-y-8">

        {/* ヘッダー */}
        <header className="text-center">
          <h1 className="text-2xl font-black tracking-tight">分析結果</h1>
          <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">6-Dimension Vector</p>
        </header>

        {/* レーダーチャート */}
        <section className="border border-slate-100 rounded-2xl p-5 space-y-5 overflow-hidden">
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
                copied
                  ? "bg-slate-900 text-white border-slate-900"
                  : "text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {copied ? <><CheckCircle2 className="w-3.5 h-3.5" />コピー完了</> : <><Copy className="w-3.5 h-3.5" />URLをコピー</>}
            </button>
          </div>
        </section>

        {/* ─── メール登録ゲート ─── */}
        {!emailSaved ? (
          <section className="border border-slate-100 rounded-2xl p-6 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black">御告げを受け取る</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                メールアドレスを登録すると、あなた専用のAIレポートが解禁されます。
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
                disabled={isSavingEmail}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isSavingEmail ? "登録中..." : "解禁する"}
              </button>
              <p className="text-center text-xs text-slate-400">パスワード不要。大学メール以外でもOK。</p>
            </form>
          </section>
        ) : (
          <>
            {/* ─── おみくじ ─── */}
            {isGenerating ? (
              <section className="border border-slate-100 rounded-2xl p-10 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                <p className="text-slate-400 text-xs tracking-widest uppercase">生成中</p>
              </section>
            ) : report ? (
              <section className="space-y-3">
                <p className="text-xs text-slate-400 text-center tracking-widest uppercase">Digital Omikuji</p>
                {OMIKUJI_SECTIONS.map((sec, idx) => (
                  <div key={sec.key} className="border border-slate-100 rounded-2xl p-5 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-black text-slate-900">{sec.label}</span>
                      <span className="text-[10px] text-slate-400">{sec.sub}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed pl-6">{report[sec.key]}</p>
                  </div>
                ))}
              </section>
            ) : hasValidSynthesis && plainParagraphs.length > 0 ? (
              <section className="border border-slate-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">御告げ</p>
                {plainParagraphs.map((para: string, i: number) => (
                  <p key={i} className="text-slate-700 text-sm leading-relaxed">{para}</p>
                ))}
              </section>
            ) : (
              <section className="border border-slate-100 rounded-2xl p-8 flex flex-col items-center gap-4">
                <p className="text-slate-400 text-sm">生成に失敗しました</p>
                <button
                  onClick={handleRegenerate}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800"
                >
                  もう一度引き直す
                </button>
              </section>
            )}

            {/* 保存通知 */}
            <p className="text-center text-xs text-slate-400">
              このレポートは保存されました。
              <a href="/mypage" className="text-slate-900 font-bold underline ml-1">マイページ</a>
              からいつでも確認できます。
            </p>

            {/* ─── マッチング ─── */}
            <section className="space-y-3">
              <h2 className="text-center text-sm font-black text-slate-900">マッチングに参加する</h2>

              {/* キャンパスマッチ */}
              <div className="border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black">キャンパスマッチ</p>
                    <p className="text-[10px] text-slate-400">武蔵野大学生限定</p>
                  </div>
                </div>
                {campusRegistered ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                    登録完了
                  </div>
                ) : (
                  <form onSubmit={handleCampusMatch} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="@stu.musashino-u.ac.jp"
                      value={campusEmail}
                      onChange={(e) => setCampusEmail(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-xs transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isMatchRegistering === 'campus'}
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 disabled:opacity-50 shrink-0"
                    >
                      {isMatchRegistering === 'campus' ? '...' : '参加'}
                    </button>
                  </form>
                )}
                {campusError && <p className="text-red-500 text-xs">{campusError}</p>}
              </div>

              {/* 通常マッチ */}
              <div className="border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black">通常マッチ</p>
                    <p className="text-[10px] text-slate-400">誰でも参加可能</p>
                  </div>
                </div>
                {generalRegistered ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                    登録完了
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">
                      登録済みのメール（<span className="font-bold text-slate-700">{email}</span>）で参加します。
                    </p>
                    <button
                      onClick={handleGeneralMatch}
                      disabled={isMatchRegistering === 'general'}
                      className="w-full py-2.5 border border-slate-200 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isMatchRegistering === 'general' ? '登録中...' : '参加する'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* やり直す */}
        <div className="text-center pb-8">
          <Link href="/diagnostic" className="text-xs text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest transition-colors">
            やり直す
          </Link>
        </div>
      </main>
    </div>
  );
}
