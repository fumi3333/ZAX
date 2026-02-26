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
                className="bg-white p-8 border border-[#E5E5E5] shadow-[8px_8px_0px_#E5E5E5]"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="w-24 h-24 rounded-full border border-black flex items-center justify-center mb-6 bg-[#F9F9F9]">
                        <ShieldQuestion size={40} className="text-[#0022FF]" />
                    </div>
                    <h2 className="text-3xl font-black mt-4 text-black tracking-tighter">共鳴を検知</h2>
                    <p className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">Match ID: #88X-29</p>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="bg-[#F9F9F9] p-6 border border-[#E5E5E5] font-mono">
                        <div className="flex items-center gap-2 mb-4 text-[#0022FF] border-b border-[#E5E5E5] pb-2">
                            <BrainCircuit size={16} />
                            <span className="text-xs font-bold tracking-widest uppercase">ZAX-9000 // LOGIC_KERNEL</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                            {reasoning || "Analyzing Vector Space...\nCalculating Delta Variables...\nSearching for Resonance Identity..."}
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-sm px-2 font-bold border-t border-[#E5E5E5] pt-4">
                        <span className="text-black">Attributes: <span className="text-slate-400 font-normal">Secondary</span></span>
                        <span className="text-[#0022FF]">Resonance: {score || 94}%</span>
                    </div>
                </div>

                <button
                    onClick={onStartChat}
                    className="w-full py-5 bg-black text-white font-bold tracking-widest hover:bg-[#0022FF] transition-colors flex items-center justify-center gap-3 text-sm"
                >
                    INITIATE BLIND CHAT
                </button>
            </motion.div>
        </div>
    );
}
