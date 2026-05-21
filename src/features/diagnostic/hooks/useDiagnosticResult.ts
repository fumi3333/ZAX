"use client";

import { useEffect, useState } from "react";
import type { ResultData } from "../types";

export function useDiagnosticResult(resultId: string) {
  const [data, setData]       = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/diagnostic/result/${resultId}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then(json => {
        if (json && !json.error) setData(json);
        else setError(json?.error || "データの取得に失敗しました");
      })
      .catch(() => {
        try {
          const cached = sessionStorage.getItem(`diagnostic_result_${resultId}`);
          if (cached) setData(JSON.parse(cached));
          else setError("結果の取得に失敗しました。もう一度診断をお試しください。");
        } catch {
          setError("結果の取得に失敗しました。もう一度診断をお試しください。");
        }
      })
      .finally(() => setLoading(false));
  }, [resultId]);

  return { data, setData, loading, error };
}
