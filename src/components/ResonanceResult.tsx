"use client";

import { motion } from "framer-motion";
import { User, ShieldQuestion, BrainCircuit } from "lucide-react";

interface ResonanceResultProps {
    onStartChat: () => void;
}

export default function ResonanceResult({ onStartChat }: ResonanceResultProps) {
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
                    <h2 className="text-2xl font-bold mt-4 text-white">Resonance Detected</h2>
                    <p className="text-zax-muted">Match ID: #88X-29</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-zax-accent">
                            <BrainCircuit size={18} />
                            <span className="text-sm font-bold uppercase">AI Resonance Logic</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-300">
                            あなたの「変わろうとする意思」と、相手の「現状を打破する経験」が高い次元で補完し合っています。
                            また、あなたが隠している「こだわり」を、この相手は最も純粋に評価する可能性が示唆されました。
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-400 px-2">
                        <span>Attribute Distance: High (Good)</span>
                        <span className="text-zax-glow">Essence Overlap: 94%</span>
                    </div>
                </div>

                <button
                    onClick={onStartChat}
                    className="w-full py-4 bg-gradient-to-r from-zax-accent to-zax-glow rounded-xl text-white font-bold tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(112,0,255,0.5)]"
                >
                    ENTER BLIND CHAT
                </button>
            </motion.div>
        </div>
    );
}
