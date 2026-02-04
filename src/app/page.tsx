"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, Shield, Menu, X } from "lucide-react";
import EssenceInput from "@/components/EssenceInput";
import BlindChat from "@/components/BlindChat";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [view, setView] = useState<"landing" | "input" | "chat">("landing");
  const [resonanceData, setResonanceData] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputComplete = (data: any) => {
    console.log("Input Complete:", data);
    setResonanceData(data);
    setView("chat");
  };

  const features = [
    {
      icon: Brain,
      title: "AI本質抽出",
      desc: "あなたの回答から潜在的な価値観をベクトル化。表面的な条件ではなく、思考の波長で解析します。",
      color: "#7C3AED",
    },
    {
      icon: Zap,
      title: "共鳴シンク",
      desc: "互いの「本質」がどれだけ共鳴するかを数値化。対話の前から、深い繋がりを予測します。",
      color: "#0EA5E9",
    },
    {
      icon: Shield,
      title: "ブラインド接続",
      desc: "先入観を排除するため、最初は相手の顔もスペックも見えません。心で会話する体験を。",
      color: "#10B981",
    },
  ];

  return (
    <main 
      className="min-h-screen font-sans overflow-hidden"
      style={{ 
        backgroundColor: '#FAFAFA', 
        color: '#1A1A1A',
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.03) 0%, transparent 50%)`,
      }}
    >
      {/* Header - Robust Fixed Layout */}



      {/* VIEW: LANDING PAGE */}
      {view === "landing" && (
        <section className="relative z-10 font-sans cursor-default">
          
          {/* 1. Hero Section - Design 3.0: Maximum Impact */}
          <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full max-w-[1200px] mx-auto flex flex-col items-center"
            >
              {/* Protocol Badge - Hidden when menu is open to prevent overlap */}
              {!isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full mb-16"
                  style={{ backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)' }}
                >
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse delay-100" />
                    <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse delay-200" />
                  </div>
                  <span className="text-base font-bold tracking-[0.2em]" style={{ color: '#7C3AED' }}>ZAX PROTOCOL v2.0</span>
                </motion.div>
              )}

              {/* Main Headline */}
              <h1 className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-black tracking-tighter mb-20 leading-[0.9] select-none">
                <span style={{ color: '#1A1A1A' }}>本質で、</span>
                <br />
                <span 
                  style={{ 
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #0EA5E9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 20px 40px rgba(124, 58, 237, 0.15))'
                  }}
                >
                  繋がる。
                </span>
              </h1>

              {/* Huge CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 30px 60px rgba(124, 58, 237, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                onClick={() => setView("input")}
                className="group relative px-24 py-12 rounded-full font-black text-4xl overflow-hidden tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: 'white',
                  boxShadow: '0 20px 50px rgba(124, 58, 237, 0.3)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-6">
                  診断を開始
                  <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform duration-300" strokeWidth={3} />
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              </motion.button>
              
              <div className="mt-24 text-sm text-gray-400 font-mono tracking-[0.3em] opacity-50 animate-pulse">
                SCROLL TO DISCOVER
              </div>
            </motion.div>
          </div>

          {/* 2. Feature Cards - Design 4.0: Modern Process Flow */}
          <div className="w-full max-w-[800px] mx-auto px-6 py-40">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="group relative pl-0 md:pl-32 mb-40 last:mb-0"
              >
                {/* Connecting Line (Subtle) */}
                {i !== features.length - 1 && (
                  <div 
                    className="hidden md:block absolute left-[3.5rem] top-24 bottom-[-10rem] w-px bg-gradient-to-b from-slate-200 to-transparent" 
                  />
                )}

                {/* Step Indicator (Floating Left) */}
                <div className="hidden md:flex absolute left-0 top-0 w-28 flex-col items-center">
                   <div 
                     className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-center relative z-10 group-hover:-translate-y-1 transition-transform duration-500"
                   >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} strokeWidth={2} />
                   </div>
                   <div className="mt-4 text-[10px] font-bold tracking-widest text-slate-400 font-mono">
                      0{i + 1}
                   </div>
                </div>

                {/* Mobile Icon (Inline) */}
                <div className="md:hidden flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} strokeWidth={2} />
                   </div>
                   <span className="text-xs font-bold tracking-widest text-slate-400 font-mono">STEP 0{i + 1}</span>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-slate-500 leading-relaxed md:leading-loose font-medium">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>


        </section>
      )}

      {/* VIEW: INPUT FORM */}
      {view === "input" && (
        <EssenceInput onComplete={handleInputComplete} />
      )}

      {/* VIEW: BLIND CHAT */}
      {view === "chat" && (
        <BlindChat onEndChat={() => setView("landing")} />
      )}

      {/* Fullscreen Menu Overlay - Right Side Drawer (Fixed with Robust CSS) */}

    </main>
  );
}
