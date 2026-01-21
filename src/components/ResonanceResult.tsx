"use client";

import { motion } from "framer-motion";
import { User, ShieldQuestion, BrainCircuit } from "lucide-react";

interface ResonanceResultProps {
    onStartChat: () => void;
    reasoning?: string;
    score?: number;
}

export default function ResonanceResult({ onStartChat, reasoning, score }: ResonanceResultProps) {
    return (
        <div className="max-w-xl mx-auto w-full p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel rounded-2xl p-8 border border-zax-glow/30"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-zax-glow blur-2xl opacity-30 rounded-full" />
                        <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-zax-glow flex items-center justify-center relative z-10">
                            <ShieldQuestion size={40} className="text-zax-glow" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mt-4 text-white">共鳴を検知</h2>
                    <p className="text-zax-muted">マッチID: #88X-29</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-black/40 rounded-lg p-6 border border-white/10 font-mono">
                        <div className="flex items-center gap-2 mb-4 text-zax-glow border-b border-white/10 pb-2">
                            <BrainCircuit size={16} />
                            <span className="text-xs font-bold tracking-widest uppercase">ZAX-9000 // 論理カーネル</span>
                        </div>
                        <p className="text-xs leading-relaxed text-zax-glow/80 whitespace-pre-line">
                            {reasoning || "ベクトル空間を解析中...\nデルタ変数を計算中...\n適合する対象を検索しています..."}
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-400 px-2">
                        <span>属性距離: 高 (良好)</span>
                        <span className="text-zax-glow">本質適合率: {score || 94}%</span>
                    </div>
                </div>

                <button
                    onClick={onStartChat}
                    className="w-full py-4 bg-gradient-to-r from-zax-accent to-zax-glow rounded-xl text-white font-bold tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(112,0,255,0.5)]"
                >
                    ブラインドチャットを開始
                </button>
            </motion.div>
        </div>
    );
}
