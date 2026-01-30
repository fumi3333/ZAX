"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Fingerprint, Zap } from "lucide-react";

interface LandingPageProps {
    onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-zax-glow/30 selection:text-zax-glow flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-zax-accent/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-zax-glow/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            {/* Hero Content */}
            <div className="z-10 max-w-5xl px-6 w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zax-glow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-zax-glow"></span>
                        </span>
                        <span className="text-xs font-mono text-zax-muted tracking-widest uppercase">Protocol V1.0 Live</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                            ZAX
                        </span>
                    </h1>

                    <p className="text-2xl md:text-3xl font-light text-white/80 mb-2 tracking-wide">
                        Unlock Your <span className="text-zax-glow font-normal">Resonance</span>.
                    </p>
                    <p className="text-lg text-zax-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                        属性というノイズを捨て、6次元の「本質ベクトル」で繋がる。<br className="hidden md:block" />
                        これは、あなたの予測された未来ではなく、<span className="text-white">未知なる変容</span>への入り口。
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
                >
                    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-zax-glow/30 transition-colors group">
                        <Fingerprint className="w-8 h-8 text-zax-muted mb-4 group-hover:text-zax-glow transition-colors" />
                        <h3 className="text-lg font-bold mb-2">Essence Vector</h3>
                        <p className="text-sm text-zax-muted">AIがあなたの深層心理を解析し、6次元の座標（本質）として視覚化。</p>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-zax-glow/30 transition-colors group">
                        <BrainCircuit className="w-8 h-8 text-zax-muted mb-4 group-hover:text-zax-glow transition-colors" />
                        <h3 className="text-lg font-bold mb-2">Resonance Engine</h3>
                        <p className="text-sm text-zax-muted">類似性ではなく「補完性」でマッチ。あなたの欠落を埋める相手を探知。</p>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-zax-glow/30 transition-colors group">
                        <Zap className="w-8 h-8 text-zax-muted mb-4 group-hover:text-zax-glow transition-colors" />
                        <h3 className="text-lg font-bold mb-2">Delta Evolution</h3>
                        <p className="text-sm text-zax-muted">対話による内面の変化（デルタ）を記録。成長の軌跡をデータ化する。</p>
                    </div>
                </motion.div>

                {/* OTA Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(112,0,255,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg tracking-widest overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-zax-accent/20 to-zax-glow/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-3">
                        ENTER THE VOID <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </motion.button>

                <div className="mt-8 text-xs text-zax-muted font-mono">
                    POWERED BY GEMINI PRO & VECTOR KERNEL
                </div>
            </div>
        </div>
    );
}
