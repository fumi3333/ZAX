"use client";

import { useState } from "react";
import { GraduationCap, Users, CheckCircle2 } from "lucide-react";
import { useMatchRegistration } from "../hooks/useMatchRegistration";
import type { CampusName } from "../types";

interface Props {
  resultId: string | undefined;
  email: string;
}

export default function MatchRegistrationForm({ resultId, email }: Props) {
  const [campusEmail, setCampusEmail] = useState("");
  const [campusName,  setCampusName]  = useState<CampusName>("");
  const [campusGrade, setCampusGrade] = useState<number | "">("");
  const [generalAge,  setGeneralAge]  = useState<number | "">("");

  const {
    campusRegistered,
    generalRegistered,
    isRegistering,
    campusError,
    registerCampus,
    registerGeneral,
  } = useMatchRegistration(resultId);

  return (
    <section className="space-y-3">
      <h2 className="text-center text-sm font-black text-slate-900">マッチングに参加する</h2>

      {/* ── キャンパスマッチ ── */}
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
          <form
            onSubmit={(e) => { e.preventDefault(); registerCampus({ email: campusEmail, campus: campusName, grade: campusGrade }); }}
            className="space-y-3"
          >
            {/* キャンパス選択 */}
            <div className="flex gap-2">
              {([{ value: "musashino", label: "武蔵野" }, { value: "ariake", label: "有明" }] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCampusName(opt.value)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    campusName === opt.value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {opt.label}キャンパス
                </button>
              ))}
            </div>

            {/* 学年選択 */}
            <div className="flex gap-1.5 flex-wrap">
              {[{ value: 1, label: "1年" }, { value: 2, label: "2年" }, { value: 3, label: "3年" }, { value: 4, label: "4年" }, { value: 5, label: "院生" }].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCampusGrade(opt.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    campusGrade === opt.value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* メール入力 */}
            <div className="flex gap-2">
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
                disabled={isRegistering === "campus"}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 disabled:opacity-50 shrink-0"
              >
                {isRegistering === "campus" ? "..." : "参加"}
              </button>
            </div>
          </form>
        )}
        {campusError && <p className="text-red-500 text-xs">{campusError}</p>}
      </div>

      {/* ── 通常マッチ ── */}
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
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="年齢"
                min={13}
                max={99}
                value={generalAge}
                onChange={(e) => setGeneralAge(e.target.value ? Number(e.target.value) : "")}
                className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-xs transition-colors text-center"
              />
              <span className="text-xs text-slate-400">歳</span>
            </div>
            <button
              onClick={() => registerGeneral({ email, age: generalAge })}
              disabled={isRegistering === "general"}
              className="w-full py-2.5 border border-slate-200 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
            >
              {isRegistering === "general" ? "登録中..." : "参加する"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
