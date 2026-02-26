"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2 } from "lucide-react";

interface FeedbackDialogProps {
  match: {
    matchUser: { id: string; name: string };
    similarity: number;
    growthScore: number;
  } | null;
  onClose: () => void;
}

export default function FeedbackDialog({ match, onClose }: FeedbackDialogProps) {
  const [enjoyment, setEnjoyment] = useState(5);
  const [fulfillment, setFulfillment] = useState(5);
  const [growthFeel, setGrowthFeel] = useState(5);
  const [meetAgain, setMeetAgain] = useState(5);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!match) return null;

  const handleSubmit = async () => {
    const payload = {
      partnerId: match.matchUser.id,
      partnerName: match.matchUser.name,
      scores: {
        enjoyment,
        fulfillment,
        growthFeel,
        meetAgain,
      },
      feedbackText: text,
      timestamp: new Date().toISOString(),
    };

    console.log("📊 Feedback submitted:", payload);

    // 将来的にはAPIに送信
    // await fetch("/api/feedback", { method: "POST", ... })

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEnjoyment(5);
      setFulfillment(5);
      setGrowthFeel(5);
      setMeetAgain(5);
      setText("");
      onClose();
    }, 2000);
  };

  const SliderQuestion = ({
    label,
    value,
    onChange,
    leftLabel,
    rightLabel,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    leftLabel: string;
    rightLabel: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-lg font-black text-indigo-600">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {match && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] md:top-[10%] md:bottom-auto bg-white rounded-2xl shadow-2xl z-[201] overflow-y-auto"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900">送信完了</h3>
                <p className="text-sm text-slate-500 mt-2">
                  フィードバックを記録しました。<br />
                  今後のマッチング精度の向上に活用されます。
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      シミュレーション・フィードバック
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {match.matchUser.name} との相性について
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Slider Questions */}
                <div className="space-y-5">
                  <SliderQuestion
                    label="相手は楽しそうですか？"
                    value={enjoyment}
                    onChange={setEnjoyment}
                    leftLabel="楽しくなさそう"
                    rightLabel="とても楽しそう"
                  />
                  <SliderQuestion
                    label="自分は充足感を感じますか？"
                    value={fulfillment}
                    onChange={setFulfillment}
                    leftLabel="感じない"
                    rightLabel="強く感じる"
                  />
                  <SliderQuestion
                    label="成長できそうですか？"
                    value={growthFeel}
                    onChange={setGrowthFeel}
                    leftLabel="成長しなさそう"
                    rightLabel="大きく成長できそう"
                  />
                  <SliderQuestion
                    label="また会いたいですか？"
                    value={meetAgain}
                    onChange={setMeetAgain}
                    leftLabel="会いたくない"
                    rightLabel="ぜひ会いたい"
                  />
                </div>

                {/* Text Feedback */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    自由記述（任意）
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="この人との関わりで感じたことを自由に書いてください..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  フィードバックを送信
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
