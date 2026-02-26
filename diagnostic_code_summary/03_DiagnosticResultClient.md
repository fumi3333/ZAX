# DiagnosticResultClient - DiagnosticResultClient.tsx
パス: `src/components/diagnostic/DiagnosticResultClient.tsx`

## 役割
- 診断結果IDを受け取り、sessionStorageまたはAPIから結果データを取得して表示
- レーダーチャート + 分析レポートを表示
- ニックネーム・学籍番号入力でマッチング登録を行うフォームを含む

## コード
```typescript
"use client";

import { useEffect, useState } from "react";
import { questions, effectiveScore } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ResultData {
  id: string;
  synthesis: string;
  answers: Record<string, number>;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {
        setError("繝・・繧ｿ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
      }
      setLoading(false);
      return;
    }
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => setError("邨先棡縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺・ｸ蠎ｦ險ｺ譁ｭ繧偵♀隧ｦ縺励￥縺縺輔＞縲・))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold uppercase tracking-widest text-sm">Analyzing...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-slate-600 mb-6">{error || "邨先棡縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆"}</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            險ｺ譁ｭ繧偵ｄ繧顔峩縺・            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const answers = data.answers;

  // 5繧ｫ繝・ざ繝ｪ・郁ｳｪ蝠上・繝ｼ繧ｹ・峨・繧ｹ繧ｳ繧｢險育ｮ・  const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
  const categoryScores: Record<string, { sum: number; count: number }> = {};
  CATEGORY_ORDER.forEach((c) => { categoryScores[c] = { sum: 0, count: 0 }; });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find((q) => q.id === Number(qId));
    const rawScore = Number(score);
    if (q && categoryScores[q.category] && !isNaN(rawScore)) {
      categoryScores[q.category].sum += effectiveScore(q, rawScore);
      categoryScores[q.category].count += 1;
    }
  });

  // 0-100繧ｹ繧ｱ繝ｼ繝ｫ縺ｮ逕溘せ繧ｳ繧｢
  const rawByCat = CATEGORY_ORDER.map((c) => {
    const d = categoryScores[c];
    const avg = d.count > 0 ? d.sum / d.count : 4;
    return Math.round(((avg - 1) / 6) * 100);
  });
  const [social, empathy, discipline, openness, emotional] = rawByCat;

  // 6谺｡蜈・・繝・ヴ繝ｳ繧ｰ
  const userVector6d: number[] = [
    discipline, openness, empathy, discipline, openness,
    Math.round((emotional + social) / 2),
  ];

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = data.synthesis
    .split("\n")
    .filter((p: string) => p.trim() !== "")
    .map((p: string) => p.replace(/AI繝ｻ?/g, "").replace(/AI蛻・梵/g, "蛻・梵").replace(/\*/g, ""));

  const handleRegister = async () => {
    if (!nickname) return;
    setIsRegistering(true);
    try {
      const res = await fetch('/api/matching/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email })
      });
      const json = await res.json();
      if (json.success) {
        setIsRegistered(true);
      } else {
        alert("逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: " + (json.error || ""));
      }
    } catch (e) {
      alert("騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
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

        {isRegistered && (
          <section className="bg-white border-2 border-black rounded-none p-8 md:p-12 shadow-sm relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 tracking-widest text-black border-b-2 border-black pb-4">
              蛻・梵繝ｬ繝昴・繝・            </h2>
            <div className="space-y-6 text-sm md:text-base leading-relaxed text-black font-medium">
              {synthesisParagraphs.map((para: string, i: number) =>
                para.startsWith("#") ? (
                  <h3 key={i} className="text-lg font-black text-black mt-8 mb-2">
                    {para.replace(/^#+\s/, "")}
                  </h3>
                ) : (
                  <p key={i}>{para}</p>
                )
              )}
            </div>
          </section>
        )}

        <section className="text-center pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            {isRegistered ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-500 border-2 border-slate-200 rounded-none font-bold text-sm">
                逋ｻ骭ｲ螳御ｺ・＠縺ｾ縺励◆・・              </div>
            ) : (
              <div className="w-full max-w-md mx-auto bg-white p-8 border-2 border-slate-200 rounded-2xl shadow-sm text-left mt-8">
                <h3 className="text-xl font-bold mb-4 tracking-tight">縺ゅ↑縺溘・霆瑚ｷ｡繧定ｨ倬鹸縺吶ｋ</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  隧ｳ邏ｰ縺ｪ蛻・梵繝ｬ繝昴・繝医・髢ｲ隕ｧ繧・∽ｻ雁ｾ後・閾ｪ蟾ｱ螟牙ｮｹ縺ｮ霆瑚ｷ｡繧定ｨ倬鹸縺吶ｋ縺溘ａ縺ｫ縺ｯ逋ｻ骭ｲ縺悟ｿ・ｦ√〒縺吶・                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-black ml-1">繝九ャ繧ｯ繝阪・繝 (蠢・・</label>
                      <input 
                          type="text"
                          placeholder="萓・ 蛹ｿ蜷榊ｸ梧悍"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black focus:outline-none transition-colors rounded-none font-bold"
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-black ml-1">螟ｧ蟄ｦ繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ 縺ｾ縺溘・ 蟄ｦ邀咲分蜿ｷ・井ｻｻ諢擾ｼ・/label>
                      <input 
                          type="text"
                          placeholder="萓・ s1234567 縺ｾ縺溘・ 12345678"
                          value={email}
                          onChange={(e) => {
                              const val = e.target.value;
                              const trimmed = val.trim().toLowerCase();
                              if (/^[sS]\d{7}$/.test(trimmed) || /^\d{8}$/.test(trimmed)) {
                                  setEmail(`${trimmed}@stu.musashino-u.ac.jp`);
                              } else {
                                  setEmail(val);
                              }
                          }}
                          className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black focus:outline-none transition-colors rounded-none placeholder:text-gray-300 font-bold"
                      />
                      <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">
                          窶ｻ s・・譯・縺ｾ縺溘・ 8譯√・蟄ｦ邀咲分蜿ｷ繧貞・蜉帙＠縺溽椪髢薙↓縲　stu.musashino-u.ac.jp 縺瑚・蜍募・蜉帙＆繧後∪縺吶・br/>
                          窶ｻ繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｯ繝上ャ繧ｷ繝･蛹悶＆繧後※菫晏ｭ倥＆繧後∝倶ｺｺ縺ｯ迚ｹ螳壹＆繧後∪縺帙ｓ縲ょｭｦ蜀・・騾壹ラ繝｡繧､繝ｳ蛻､螳壹↓菴ｿ逕ｨ縺輔ｌ縺ｾ縺吶・br/>
                          窶ｻ騾∽ｿ｡繝懊ち繝ｳ繧呈款縺吶％縺ｨ縺ｧ縲・a href="/terms" target="_blank" className="underline hover:text-black">蛻ｩ逕ｨ隕冗ｴ・/a>縺翫ｈ縺ｳ<a href="/privacy" target="_blank" className="underline hover:text-black">繝励Λ繧､繝舌す繝ｼ繝昴Μ繧ｷ繝ｼ</a>縺ｫ蜷梧э縺励◆繧ゅ・縺ｨ縺ｿ縺ｪ縺輔ｌ縺ｾ縺吶・                      </p>
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || !nickname.trim()}
                    className="w-full mt-4 flex justify-center items-center gap-3 px-8 py-4 bg-black text-white border-2 border-black rounded-none font-bold text-sm hover:bg-white hover:text-black transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isRegistering ? "蜃ｦ逅・ｸｭ..." : "蛻・梵繝ｬ繝昴・繝医ｒ險倬鹸縺励※遒ｺ隱阪☆繧・}
                    {!isRegistering && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

```
