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

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full mx-auto"
            >
                <div className="glass-panel p-8 rounded-2xl text-center border border-zax-glow/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-zax-glow/5" />
                    <CheckCircle size={64} className="text-zax-glow mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-2">Evolution Recorded</h2>
                    <p className="text-zax-muted mb-8">あなたの本質ベクトルが更新されました。</p>

                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">Using Logic</div>
                            <div className="text-sm text-zax-muted">Type</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-zax-glow flex items-center gap-1 justify-center">
                                +5% <TrendingUp size={16} />
                            </div>
                            <div className="text-sm text-zax-muted">Receptivity</div>
                        </div>
                    </div>

                    <div className="w-full h-48 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center relative">
                        {/* Simulated Graph */}
                        <svg viewBox="0 0 400 150" className="w-full h-full p-4">
                            <polyline
                                points="0,100 50,90 100,110 150,60 200,70 250,40 300,50 350,20 400,30"
                                fill="none"
                                stroke="#7000FF"
                                strokeWidth="2"
                            />
                            <polyline
                                points="0,100 50,85 100,100 150,50 200,60 250,30 300,40 350,10 400,20"
                                fill="none"
                                stroke="#00F0FF"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                        </svg>
                        <div className="absolute top-4 right-4 text-xs text-zax-glow">
                            Current: V2.1 (Expanded)
                        </div>
                    </div>

                    <button
                        onClick={onRestart}
                        className="mt-8 text-sm text-white/50 hover:text-white transition-colors underline decoration-dotted block mx-auto"
                    >
                        Start New Simulation
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
                className="glass-panel p-8 rounded-2xl border border-white/10"
            >
                <h2 className="text-2xl font-bold text-white mb-6">Reflection</h2>
                <p className="text-gray-300 mb-4">
                    相手との対話を通じて、自分の中に新しく発見した感情や側面はありますか？
                </p>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-zax-glow/50 mb-6"
                    placeholder="例：自分のこだわりが、実は他人にとっても価値があることに気づいた..."
                />
                <button
                    onClick={async () => {
                        if (!feedback) return;
                        try {
                            await fetch("/api/feedback", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    feedback,
                                    currentVector: [50, 60, 70, 60, 50, 80]
                                }),
                            });
                        } catch (e) { console.error(e); }
                        setSubmitted(true);
                    }}
                    disabled={!feedback}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    COMPLETE EVOLUTION
                </button>
            </motion.div>
        </div>
    );
}
