"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const QUESTIONS = [
  { key: "aboutPartner" as const, label: "相手はどうでしたか？", placeholder: "例: 話しやすかった" },
  { key: "howChanged" as const, label: "自分はどう変わった？", placeholder: "例: 新しい視点が得られた" },
  { key: "grew" as const, label: "成長を実感できた？", placeholder: "例: 少し" },
  { key: "togetherFeel" as const, label: "一緒にいてどうだった？", placeholder: "例: 居心地が良かった" },
];

interface PostChatInterviewProps {
  partnerName: string;
  onSubmit: (answers: {
    aboutPartner: string;
    howChanged: string;
    grew: string;
    togetherFeel: string;
  }) => void;
  onSkip: () => void;
}

export default function PostChatInterview({
  partnerName,
  onSubmit,
  onSkip,
}: PostChatInterviewProps) {
  const [aboutPartner, setAboutPartner] = useState("");
  const [howChanged, setHowChanged] = useState("");
  const [grew, setGrew] = useState("");
  const [togetherFeel, setTogetherFeel] = useState("");

  const handleSubmit = () => {
    onSubmit({ aboutPartner, howChanged, grew, togetherFeel });
  };

  const filled =
    aboutPartner.trim() ||
    howChanged.trim() ||
    grew.trim() ||
    togetherFeel.trim();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative perspective-1000">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500 text-slate-900">
          <CardContent className="p-8 sm:p-12 text-center space-y-10">
            <div className="space-y-4">
              <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                振り返り
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                {partnerName}さんとの振り返り
              </h2>
              <p className="text-sm text-slate-500">短くでOKです</p>
            </div>

            <div className="space-y-5 text-left">
            {QUESTIONS.map((q) => {
              const value =
                q.key === "aboutPartner"
                  ? aboutPartner
                  : q.key === "howChanged"
                    ? howChanged
                    : q.key === "grew"
                      ? grew
                      : togetherFeel;
              const setValue =
                q.key === "aboutPartner"
                  ? setAboutPartner
                  : q.key === "howChanged"
                    ? setHowChanged
                    : q.key === "grew"
                      ? setGrew
                      : setTogetherFeel;
              return (
                <div key={q.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {q.label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
                  />
                </div>
              );
            })}
          </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                スキップ
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!filled}
                className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                送信
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
