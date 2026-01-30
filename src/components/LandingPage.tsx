"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BrainCircuit, Fingerprint, Zap } from "lucide-react";

interface LandingPageProps {
    onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-zax-glow/30 selection:text-zax-glow flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background - Clean & Subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-zax-glow/5 rounded-full blur-[120px]" />
            </div>

            {/* Hero Content */}
            <div className="z-10 max-w-5xl px-6 w-full text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-12">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zax-glow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-zax-glow"></span>
                        </span>
                        <span className="text-xs text-white/70 tracking-wider">Online</span>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="text-xs text-zax-muted font-mono">
                            POWERED BY GEMINI PRO & VECTOR KERNEL
                        </div>
                        <a href="/philosophy" className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-4">
                            Our Philosophy
                        </a>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
                        ZAX
                    </h1>

                    <p className="text-2xl md:text-3xl font-medium text-white/90 mb-6 tracking-wide">
                        価値観でつながる、新しい体験。
                    </p>
                    <p className="text-base text-gray-400 mb-16 max-w-lg mx-auto leading-relaxed">
                        表面的なプロフィールではなく、<br className="hidden md:block" />
                        あなたの「本質」から共鳴する相手を見つけ出します。
                    </p>
                </motion.div>

                {/* Feature Grid - Clean & Minimal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-3xl w-full"
                >
                    <div className="flex flex-col items-center p-4">
                        <Fingerprint className="w-6 h-6 text-gray-500 mb-3" />
                        <h3 className="text-sm font-bold mb-2 text-white/90">本質分析</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">AIがあなたの思考特性を<br />6次元の数値として分析。</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <BrainCircuit className="w-6 h-6 text-gray-500 mb-3" />
                        <h3 className="text-sm font-bold mb-2 text-white/90">相性診断</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">お互いの強みと弱みを<br />補完し合う相手をマッチング。</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <Zap className="w-6 h-6 text-gray-500 mb-3" />
                        <h3 className="text-sm font-bold mb-2 text-white/90">成長記録</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">対話を通じた自己の変化を<br />データとして可視化。</p>
                    </div>
                </motion.div>

                {/* CTA Button - Simple & Clean */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEnter}
                    className="group px-10 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest hover:bg-gray-200 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        診断をはじめる <ArrowRight className="w-4 h-4" />
                    </span>
                </motion.button>
            </div>
        </div>
    );
}
