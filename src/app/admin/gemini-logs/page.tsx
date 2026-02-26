"use client";

import { useEffect, useState } from "react";
// 管理画面: 本番では認証・権限チェックを追加推奨
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface GeminiLog {
  id: string;
  type: string;
  prompt: string;
  response: string;
  metadata: string | null;
  createdAt: string;
}

export default function GeminiLogsPage() {
  const [logs, setLogs] = useState<GeminiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    const url = type ? `/api/gemini-logs?type=${type}&limit=50` : "/api/gemini-logs?limit=50";
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setLogs(data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          マイページへ戻る
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Gemini 判断ログ
        </h1>

        <div className="mb-6 flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">すべて</option>
            <option value="synthesis">synthesis</option>
            <option value="matchReasoning">matchReasoning</option>
            <option value="reflectionSummary">reflectionSummary</option>
            <option value="analyzeEssence">analyzeEssence</option>
            <option value="calculateDeltaVector">calculateDeltaVector</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 py-8">ログがありません</p>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-100 flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-indigo-600">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Prompt
                    </p>
                    <pre className="text-xs bg-slate-50 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                      {log.prompt}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Response
                    </p>
                    <pre className="text-xs bg-indigo-50 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                      {log.response}
                    </pre>
                  </div>
                  {log.metadata && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                        Metadata
                      </p>
                      <pre className="text-xs bg-slate-50 p-3 rounded overflow-x-auto">
                        {log.metadata}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
