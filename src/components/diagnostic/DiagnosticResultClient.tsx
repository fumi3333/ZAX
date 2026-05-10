"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
const DIMENSION_LABELS = ["生活基盤", "社会意識", "信頼構築", "対話力", "野心", "寛容性"];
import ResultRadarChart from "./ResultRadarChart";
import Link from "next/link";
import { Loader2, BookOpen, Copy, CheckCircle2, Mail } from "lucide-react";

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

  // Email registration state
  const [email, setEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Report regeneration state
  const [isGenerating, setIsGenerating] = useState(false);

  // Copy URL state
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
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify({ ...data, synthesis: d.synthesis }));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem(`diagnostic_result_${resultId}`);
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

  if (loading) {
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
        <div className="text-center max-w-md px-6 space-y-6">
          <p className="text-slate-600">{error || "結果が見つかりませんでした"}</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
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

  const synthesisParagraphs = (data.synthesis || "")
    .split("\n")
    .filter((p: string) => p.trim() !== "");

  const hasValidSynthesis = data.synthesis && !data.synthesis.includes("分析エラー") && synthesisParagraphs.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* ヘッダー */}
        <section className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            分析結果
          </h1>
          <p className="text-slate-400 text-sm">6次元ベクトルによる価値観マッピング</p>
        </section>

        {/* レーダーチャート: 常時表示 */}
        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-slate-200/60">
          <h2 className="text-xs font-bold mb-8 text-center text-slate-400 uppercase tracking-widest">特性ベクトル</h2>
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
          <div className="mt-8 flex justify-center border-t border-slate-100 pt-6">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2 ${
                copied
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-transparent text-slate-900 border-slate-900 hover:bg-slate-50"
              }`}
            >
              {copied
                ? <><CheckCircle2 className="w-4 h-4" />コピー完了</>
                : <><Copy className="w-4 h-4" />結果URLをコピー</>
              }
            </button>
          </div>
        </section>

        {/* AIレポートセクション: メール登録でアンロック */}
        <section className="relative">
          {emailSaved ? (
            /* 登録済み: フルレポート表示 */
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200 space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <BookOpen className="w-6 h-6 text-slate-900" />
                <h2 className="text-2xl font-black text-slate-900">分析レポート</h2>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  <p className="text-slate-500 font-medium">Geminiが分析中...</p>
                </div>
              ) : hasValidSynthesis ? (
                <div className="space-y-5 text-base leading-loose text-slate-700">
                  {synthesisParagraphs.map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <p className="text-slate-500 font-medium">レポートの生成中にエラーが発生しました。</p>
                  <button
                    onClick={handleRegenerate}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    レポートを再生成する
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  このレポートは保存されました。
                  <a href="/mypage" className="text-slate-900 font-bold underline ml-1">
                    変遷ログ（mypage）
                  </a>
                  からいつでも見返せます。
                </p>
              </div>
            </div>
          ) : (
            /* 未登録: ぼかしプレビュー + メール入力ゲート */
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-200">
              {/* ぼかされたレポートプレビュー */}
              <div className="bg-white p-8 md:p-12 select-none pointer-events-none">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-8">
                  <BookOpen className="w-6 h-6 text-slate-200" />
                  <h2 className="text-2xl font-black text-slate-200">分析レポート</h2>
                </div>
                <div className="space-y-4 blur-md opacity-50">
                  {hasValidSynthesis ? (
                    synthesisParagraphs.slice(0, 4).map((para: string, i: number) => (
                      <p key={i} className="text-slate-400 text-base leading-loose">{para}</p>
                    ))
                  ) : (
                    <>
                      <p className="text-slate-300 text-base leading-loose">あなたは高い自律性を持ち、知的探求を重視する人物です。信頼の構築に時間をかける傾向があり、一度築いた関係は深く長続きします。</p>
                      <p className="text-slate-300 text-base leading-loose">価値観のコアには本質への誠実さがあり、表面的な合意よりも深い理解を求める姿勢が際立ちます。</p>
                      <p className="text-slate-300 text-base leading-loose">コミュニケーションにおいては、感情より論理を優先する傾向があり、議論を通じて関係を深めていきます...</p>
                    </>
                  )}
                </div>
              </div>

              {/* ゲートオーバーレイ */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/10 via-white/85 to-white rounded-2xl">
                <div className="text-center max-w-sm mx-auto px-6 space-y-6 pt-24 pb-10">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">レポートを読む</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      メールアドレスを登録するとAIレポートが解禁されます。
                      同じアドレスで再診断すると変遷ログが蓄積されます。
                    </p>
                  </div>
                  <form onSubmit={handleSaveEmail} className="flex flex-col gap-3 w-full">
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
                    {emailError && (
                      <p className="text-red-500 text-xs font-bold text-center">{emailError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingEmail}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {isSavingEmail ? "登録中..." : "レポートを解禁する →"}
                    </button>
                    <p className="text-center text-xs text-slate-400">
                      大学メール以外でもOK。パスワード不要。
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* やり直す */}
        <section className="text-center pt-4">
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
