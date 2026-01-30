"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Fingerprint, Zap } from "lucide-react";
import HeroVisual from "@/components/HeroVisual";

interface LandingPageProps {
    onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#08080C] text-white selection:bg-zax-glow/30 selection:text-zax-glow flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background - High Density Grid */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zax-glow/5 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            {/* Central Visual Layer */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
                <div className="w-full max-w-4xl aspect-square">
                    <HeroVisual />
                </div>
            </div>

            {/* Main Content - Centralized */}
            <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center relative">

                {/* Status Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-zax-glow/20 bg-black/40 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zax-glow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-zax-glow"></span>
                        </span>
                        <span className="text-xs text-zax-glow tracking-widest font-mono">SYSTEM ONLINE</span>
                    </div>
                </motion.div>

                {/* Title & Headline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-16"
                >
                    <h1 className="text-8xl md:text-9xl font-bold tracking-tighter mb-6 text-white text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                        ZAX
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-white/90 mb-6 tracking-wide leading-relaxed max-w-2xl">
                        価値観でつながる、<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zax-glow to-zax-accent">新しい知性体コミュニケーション</span>
                    </p>
                    <p className="text-sm text-zax-muted max-w-lg leading-relaxed mix-blend-plus-lighter">
                        表面的なプロフィールではなく、あなたの「本質」から共鳴する相手を見つけ出します。
                        AIが描く、6次元のベクトルの軌跡。
                    </p>
                </motion.div>

                {/* Massive CTA Button (Reactor Core) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-24 relative group"
                >
                    {/* Glow Effect behind button */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-zax-glow to-zax-accent rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />

                    <button
                        onClick={onEnter}
                        className="relative w-full md:w-auto min-w-[300px] px-12 py-6 bg-white text-black text-xl font-bold tracking-[0.2em] rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(0,240,255,0.5)] flex items-center justify-center gap-4"
                    >
                        <span>診断を開始</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <div className="mt-6">
                        <a href="/philosophy" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest border-b border-transparent hover:border-white/40 pb-1">
                            PHILOSOPHY
                        </a>
                    </div>
                </motion.div>

                {/* Minimal Feature List (No Borders) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-3xl border-t border-white/5 pt-12"
                >
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-zax-glow/10 transition-colors">
                            <Fingerprint className="w-6 h-6 text-zax-glow" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-white/90 tracking-wide">本質分析</h3>
                        <p className="text-[10px] text-zax-muted leading-relaxed max-w-[200px]">思考特性を6次元ベクトルとして分析</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-zax-accent/10 transition-colors">
                            <BrainCircuit className="w-6 h-6 text-zax-accent" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-white/90 tracking-wide">共鳴マッチング</h3>
                        <p className="text-[10px] text-zax-muted leading-relaxed max-w-[200px]">1000次元の空間計算による最適解</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-purple-500/10 transition-colors">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-white/90 tracking-wide">成長記録</h3>
                        <p className="text-[10px] text-zax-muted leading-relaxed max-w-[200px]">対話を通じた自己の変化を可視化</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
