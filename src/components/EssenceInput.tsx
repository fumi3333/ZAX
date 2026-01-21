"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EssenceInputProps {
    onComplete: (data: string[]) => void;
}

export default function EssenceInput({ onComplete }: EssenceInputProps) {
    const [fragments, setFragments] = useState(["", "", ""]);
    const [activeindex, setActiveIndex] = useState(0);

    const placeholders = [
        "誰にも理解されない、あなたの密かなこだわりは？",
        "時間を忘れて没頭してしまう、その瞬間とは？",
        "変えたいと思っている、自分自身の矛盾点は？"
    ];

    const handleNext = () => {
        if (activeindex < 2) {
            setActiveIndex(activeindex + 1);
        } else {
            onComplete(fragments);
        }
    };

    const updateFragment = (text: string) => {
        const newFragments = [...fragments];
        newFragments[activeindex] = text;
        setFragments(newFragments);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zax-glow to-zax-accent mb-4">
                    本質の核
                </h1>
                <p className="text-zax-muted text-lg">
                    属性というノイズを捨て、本質の断片を入力してください。
                </p>
            </motion.div>

            <div className="relative w-full">
                {placeholders.map((question, idx) => (
                    idx === activeindex && (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full"
                        >
                            <label className="block text-xl text-white mb-4 font-light">
                                <span className="text-zax-glow mr-2">0{idx + 1}.</span>
                                {question}
                            </label>
                            <textarea
                                value={fragments[idx]}
                                onChange={(e) => updateFragment(e.target.value)}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-lg text-white placeholder-white/20 focus:outline-none focus:border-zax-glow/50 focus:ring-1 focus:ring-zax-glow/50 transition-all resize-none glass-panel mb-6"
                                placeholder="ここに記述してください..."
                                autoFocus
                            />

                            {/* Context Slider (Data Design Refinement) */}
                            <div className="w-full bg-black/20 rounded-lg p-4 border border-white/5">
                                <div className="flex justify-between text-xs text-zax-muted mb-2 uppercase tracking-widest">
                                    <span>直感 (Intuition)</span>
                                    <span>論理 (Logic)</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-zax-glow"
                                />
                            </div>
                        </motion.div>
                    )
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!fragments[activeindex]}
                className="mt-12 group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-zax-accent to-zax-glow opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="absolute inset-0 border border-white/20 rounded-full" />
                <span className="relative flex items-center gap-2 text-white text-lg tracking-wider">
                    {activeindex < 2 ? "次の断片へ" : "本質を解析する"}
                    {activeindex < 2 ? <ArrowRight size={20} /> : <Sparkles size={20} />}
                </span>
            </motion.button>

            {/* Progress Indicators */}
            <div className="flex gap-2 mt-8">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            i === activeindex ? "w-8 bg-zax-glow" : "w-2 bg-white/20",
                            i < activeindex && "bg-zax-accent"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
