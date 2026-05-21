"use client";

import { useState } from "react";
import type { CampusName, MatchType } from "../types";

export function useMatchRegistration(resultId: string | undefined) {
  const [campusRegistered,  setCampusRegistered]  = useState(false);
  const [generalRegistered, setGeneralRegistered] = useState(false);
  const [isRegistering,     setIsRegistering]     = useState<MatchType | null>(null);
  const [campusError,       setCampusError]       = useState<string | null>(null);

  async function registerCampus(params: {
    email: string;
    campus: CampusName;
    grade: number | "";
  }) {
    if (!params.campus) { setCampusError("所属キャンパスを選択してください"); return; }
    if (!params.email.includes("@")) { setCampusError("大学のメールアドレスを入力してください"); return; }
    setCampusError(null);
    setIsRegistering("campus");
    try {
      const res = await fetch("/api/match/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          type: "campus",
          campus: params.campus,
          grade: params.grade || null,
          resultId,
        }),
      });
      const json = await res.json();
      if (json?.success) setCampusRegistered(true);
      else setCampusError(json?.error || "登録に失敗しました");
    } catch {
      setCampusError("通信エラーが発生しました");
    } finally {
      setIsRegistering(null);
    }
  }

  async function registerGeneral(params: { email: string; age: number | "" }) {
    setIsRegistering("general");
    try {
      await fetch("/api/match/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          type: "general",
          age: params.age || null,
          resultId,
        }),
      });
      setGeneralRegistered(true);
    } catch { /* silently fail */ }
    finally { setIsRegistering(null); }
  }

  return {
    campusRegistered,
    generalRegistered,
    isRegistering,
    campusError,
    registerCampus,
    registerGeneral,
  };
}
