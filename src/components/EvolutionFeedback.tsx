"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle, TrendingUp } from "lucide-react";

interface EvolutionFeedbackProps {
    onRestart: () => void;
}

export default function EvolutionFeedback({ onRestart }: EvolutionFeedbackProps) {
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    if (submitted) {
        // ... (Keep existing submitted view logic)
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full mx-auto"
            >
                <div className="bg-white p-8 rounded-2xl text-center border border-[#E5E5E5] shadow-[8px_8px_0px_#E5E5E5] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#0022FF]/5" />
                    <CheckCircle size={64} className="text-[#0022FF] mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-black mb-2 tracking-tight">進化が記録されました</h2>
                    <p className="text-slate-500 mb-8">本質ベクトルの更新が完了しました。</p>

                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-black">論理思考</div>
                            <div className="text-sm text-slate-500">強化領域</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#0022FF] flex items-center gap-1 justify-center">
                                +5% <TrendingUp size={16} />
                            </div>
                            <div className="text-sm text-slate-500">受容性</div>
                        </div>
                    </div>

                    <div className="w-full h-48 bg-[#F9F9F9] rounded-xl border border-[#E5E5E5] flex items-center justify-center relative">
                        {/* Simulated Graph */}
                        <svg viewBox="0 0 400 150" className="w-full h-full p-4">
                            <polyline
                                points="0,100 50,90 100,110 150,60 200,70 250,40 300,50 350,20 400,30"
                                fill="none"
                                stroke="#0022FF"
                                strokeWidth="2"
                            />
                            <polyline
                                points="0,100 50,85 100,100 150,50 200,60 250,30 300,40 350,10 400,20"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                        </svg>
                        <div className="absolute top-4 right-4 text-xs text-[#0022FF] font-mono">
                            VER: V2.1 (Expanded)
                        </div>
                    </div>

                    <button
                        onClick={onRestart}
                        className="mt-8 text-sm text-slate-400 hover:text-[#0022FF] transition-colors underline decoration-dotted block mx-auto"
                    >
                        新しいシミュレーションを開始
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-xl w-full mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-[8px_8px_0px_#E5E5E5]"
            >
                <h2 className="text-2xl font-bold text-black mb-6">内省と振り返り</h2>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                    相手との対話を通じて、自分の中に新しく発見した感情や側面はありますか？
                </p>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-32 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 text-black focus:outline-none focus:border-[#0022FF] mb-6 placeholder:text-slate-400"
                    placeholder="例：自分のこだわりが、実は他人にとっても価値があることに気づいた..."
                />

                {/* Structured Signal Tags (Data Design Refinement) */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {["安心感 (Reassurance)", "違和感 (Challenge)", "閃き (Inspiration)", "肯定 (Validation)"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${selectedTags.includes(tag)
                                    ? "bg-[#0022FF]/10 border-[#0022FF] text-[#0022FF]"
                                    : "bg-white border-[#E5E5E5] text-slate-500 hover:text-[#0022FF] hover:border-[#0022FF]"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <button
                    onClick={async () => {
                        if (!feedback) return;
                        try {
                            await fetch("/api/feedback", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    feedback,
                                    currentVector: [50, 60, 70, 60, 50, 80],
                                    tags: selectedTags
                                }),
                            });
                        } catch (e) { console.error(e); }
                        setSubmitted(true);
                    }}
                    disabled={!feedback}
                    className="w-full py-3 bg-black text-white font-bold rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    進化を確定する
                </button>
            </motion.div>
        </div>
    );
}
