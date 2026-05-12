'use client';

import { useState } from 'react';

const DIMENSION_LABELS = ['生活基盤', '社会意識', '信頼構築', '対話力', '野心', '寛容性'];

interface DiagnosticEntry {
  id: string;
  createdAt: string;
  synthesis: string;
  vector: string; // JSON string
}

export default function MyPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DiagnosticEntry | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mypage/history?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success) {
        setDiagnostics(json.diagnostics);
        setSubmitted(true);
        if (json.diagnostics.length > 0) setSelected(json.diagnostics[0]);
      } else {
        setError(json.error || 'データの取得に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const parseVector = (v: string | undefined): number[] => {
    if (!v) return [50, 50, 50, 50, 50, 50];
    try { return JSON.parse(v); } catch { return [50, 50, 50, 50, 50, 50]; }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-20">

        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">My Page</span>
          <h1 className="text-4xl font-black text-slate-900">変遷ログ</h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            登録したメールアドレスで過去の診断レポートと6Dベクトルの変化を確認できます。
          </p>
        </div>

        {!submitted ? (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 space-y-4">
              <label className="block text-sm font-bold text-slate-700">メールアドレス</label>
              <input
                type="email"
                placeholder="診断時に入力したメールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-medium transition-colors"
                required
              />
              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {loading ? '検索中...' : '変遷を見る'}
              </button>
            </form>
          </div>
        ) : diagnostics.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-slate-500 font-medium">このメールアドレスに紐付く診断記録が見つかりませんでした。</p>
            <button onClick={() => setSubmitted(false)} className="text-slate-400 text-sm underline">別のアドレスで検索</button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* タイムライン選択 */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {diagnostics.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    selected?.id === d.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {new Date(d.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  <span className="ml-2 text-xs opacity-60">#{diagnostics.length - i}</span>
                </button>
              ))}
            </div>

            {/* 6Dベクトル変遷グラフ（シンプルバー表示） */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
              <h2 className="text-xl font-black mb-6 text-slate-900">6D ベクトル変遷</h2>
              <div className="space-y-3">
                {DIMENSION_LABELS.map((label, i) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{label}</span>
                      <div className="flex gap-4">
                        {diagnostics.map((d) => (
                          <span key={d.id} className={`${selected?.id === d.id ? 'text-slate-900' : 'text-slate-300'}`}>
                            {parseVector(d.vector)[i]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                      {diagnostics.map((d, di) => {
                        const val = parseVector(d.vector)[i];
                        return (
                          <div
                            key={d.id}
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                              selected?.id === d.id ? 'bg-slate-900' : 'bg-slate-200'
                            }`}
                            style={{ width: `${val}%`, opacity: selected?.id === d.id ? 1 : 0.4 - di * 0.05 }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 選択されたレポート */}
            {selected && (() => {
              let otsuge = '';
              let machihito = '';
              let koudou = '';
              let isJson = false;

              try {
                const parsed = JSON.parse(selected.synthesis);
                if (parsed && typeof parsed === 'object') {
                  otsuge = parsed.otsuge || '';
                  machihito = parsed.machihito || '';
                  koudou = parsed.koudou || '';
                  isJson = true;
                }
              } catch {
                // Not JSON
              }

              return (
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900">分析レポート</h2>
                    <span className="text-sm text-slate-400 font-bold">
                      {new Date(selected.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {isJson ? (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">01 分析結果</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">{otsuge}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">02 相性のいい相手</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">{machihito}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">03 行動指針</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">{koudou}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
                      {selected.synthesis
                        .split('\n')
                        .map(p => p.replace(/[*#()（）:：\[\]【】「」]/g, ' ').trim())
                        .filter(p => p.length >= 15)
                        .filter(p => !/はじめに|レポート|診断|おみくじ|結果|総評|相性|アプローチ/i.test(p))
                        .map((p, i) => (
                          <p key={i}>{p}</p>
                        ))
                      }
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="text-center">
              <button onClick={() => setSubmitted(false)} className="text-slate-400 text-sm underline">別のアドレスで検索</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
