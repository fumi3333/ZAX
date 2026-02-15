"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {partnerName}さんとの振り返り
      </h3>
      <p className="text-xs text-slate-500 mb-6">短くでOKです</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            相手はどうでしたか？
          </label>
          <input
            type="text"
            value={aboutPartner}
            onChange={(e) => setAboutPartner(e.target.value)}
            placeholder="例: 話しやすかった"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            自分はどう変わった？
          </label>
          <input
            type="text"
            value={howChanged}
            onChange={(e) => setHowChanged(e.target.value)}
            placeholder="例: 新しい視点が得られた"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            成長を実感できた？
          </label>
          <input
            type="text"
            value={grew}
            onChange={(e) => setGrew(e.target.value)}
            placeholder="例: 少し"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            一緒にいてどうだった？
          </label>
          <input
            type="text"
            value={togetherFeel}
            onChange={(e) => setTogetherFeel(e.target.value)}
            placeholder="例: 居心地が良かった"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          スキップ
        </button>
        <button
          onClick={handleSubmit}
          disabled={!filled}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          送信
        </button>
      </div>
    </motion.div>
  );
}
