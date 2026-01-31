"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Fingerprint, Zap } from "lucide-react";
import HeroVisual from "@/components/HeroVisual";

interface LandingPageProps {
    onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background - Light & Airy */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/40 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/40 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
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
                        <span className="text-xs text-zax-glow tracking-widest font-mono">システム稼働中</span>
                    </div>
                </motion.div>

                {/* Title & Headline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-16"
                >
                    <h1 className="text-8xl md:text-9xl font-bold tracking-tighter mb-6 text-slate-900">
                        ZAX
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-slate-600 mb-6 tracking-wide leading-relaxed max-w-2xl">
                        価値観でつながる、<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">新しい知性体コミュニケーション</span>
                    </p>
                    <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                        表面的なプロフィールではなく、あなたの「本質」から共鳴する相手を見つけ出します。
                        AIが描く、6次元のベクトルの軌跡。
                    </p>
                </motion.div>

                {/* Massive CTA Button (Reactor Core) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-32 relative group"
                >
                    {/* Glow Effect behind button */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-zax-glow to-zax-accent rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />

                    <button
                        onClick={onEnter}
                        className="relative w-full md:w-auto min-w-[300px] px-12 py-6 bg-slate-900 text-white text-xl font-bold tracking-[0.2em] rounded-full hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-4"
                    >
                        <span>診断を開始</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <div className="mt-8">
                        <a href="/about" className="text-xs text-slate-400 hover:text-blue-600 transition-colors tracking-widest border-b border-transparent hover:border-blue-600 pb-1">
                            ABOUT US (PHILOSOPHY)
                        </a>
                    </div>
                </motion.div>

                {/* Minimal Feature List (No Borders) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-3xl border-t border-slate-200 pt-12">
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-blue-50 mb-4 group-hover:bg-blue-100 transition-colors">
                            <Fingerprint className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-slate-800 tracking-wide">本質分析</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">思考特性を6次元ベクトルとして分析</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-purple-50 mb-4 group-hover:bg-purple-100 transition-colors">
                            <BrainCircuit className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-slate-800 tracking-wide">共鳴マッチング</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">1000次元の空間計算による最適解</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="p-4 rounded-full bg-slate-100 mb-4 group-hover:bg-slate-200 transition-colors">
                            <Zap className="w-6 h-6 text-slate-600" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-slate-800 tracking-wide">成長記録</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">対話を通じた自己の変化を可視化</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
