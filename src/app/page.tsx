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

          {/* 2. Feature Cards - Design 3.0: Smooth Slide-Up */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full max-w-[800px] mx-auto px-6 py-32 relative"
          >
            {/* Connecting Line */}
            <div className="absolute left-[50%] md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#7C3AED]/20 to-transparent transform -translate-x-1/2 md:translate-x-0" />

            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative mb-24 last:mb-0 md:pl-32"
              >
                {/* Timeline Node (Icon) */}
                <div 
                  className="absolute left-[50%] md:left-0 top-0 w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 md:translate-x-0 z-10 bg-white"
                  style={{ 
                    boxShadow: `0 10px 30px ${feature.color}30`,
                  }}
                >
                  <feature.icon className="w-10 h-10" style={{ color: feature.color }} strokeWidth={1.5} />
                </div>

                {/* Card */}
                <div className="mt-28 md:mt-0 p-8 md:p-10 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 text-center md:text-left relative z-0">
                  <div className="inline-block px-3 py-1 rounded-full mb-4 text-xs font-bold tracking-widest bg-slate-50 text-slate-400">
                    STEP 0{i + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-slate-900">{feature.title}</h3>
                  <p className="text-base md:text-lg leading-loose font-medium text-slate-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>


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
