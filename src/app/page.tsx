"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, Shield, Menu, X } from "lucide-react";
import EssenceInput from "@/components/EssenceInput";
import BlindChat from "@/components/BlindChat";
import Link from "next/link";

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="w-full max-w-7xl mx-auto relative h-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 z-50"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#1A1A1A' }}>ZAX</span>
          </motion.div>
          
          {/* Hamburger Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="z-50 p-2 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
            aria-label="Menu"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[#1A1A1A]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1A1A1A]" />
            )}
          </button>
        </div>
      </header>


      {/* VIEW: LANDING PAGE */}
      {view === "landing" && (
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-32">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Protocol Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#7C3AED' }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#7C3AED' }}></span>
              </span>
              <span className="text-xs font-mono tracking-wider" style={{ color: '#7C3AED' }}>ZAX PROTOCOL v2.0</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]">
              <span style={{ color: '#1A1A1A' }}>本質で、</span>
              <br />
              <span 
                style={{ 
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #0EA5E9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                繋がる。
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: '#666' }}>
              肩書きや年収などのノイズを取り払い、<br className="hidden md:block" />
              あなたの「本質的な価値観」だけで繋がる。<br className="hidden md:block" />
              AIが抽出した純粋な思考ベクトルでマッチングを行う、新しいプロトコル。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("input")}
                className="group relative px-8 py-4 rounded-full font-bold text-lg overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  マッチングを開始
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <Link 
                href="/about"
                className="px-8 py-4 font-medium transition-colors"
                style={{ color: '#666' }}
              >
                ZAXについて詳しく →
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards with Grid Fix */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-6xl mx-auto"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                className="group relative p-8 rounded-3xl transition-all duration-500"
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}08 100%)`,
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-12 md:gap-20 mt-24 text-center"
          >
            <div>
              <div 
                className="text-4xl md:text-5xl font-black"
                style={{ 
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >94.2%</div>
              <div className="text-sm mt-2" style={{ color: '#888' }}>共鳴精度</div>
            </div>
            <div className="w-px h-12" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <div>
              <div 
                className="text-4xl md:text-5xl font-black"
                style={{ 
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >12,847</div>
              <div className="text-sm mt-2" style={{ color: '#888' }}>アクティブユーザー</div>
            </div>
            <div className="w-px h-12" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <div>
              <div 
                className="text-4xl md:text-5xl font-black"
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >3.2x</div>
              <div className="text-sm mt-2" style={{ color: '#888' }}>従来比 継続率</div>
            </div>
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

      {/* Fullscreen Menu Overlay - Rendered in Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw', 
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.95)' 
              }}
            >
              <nav className="flex flex-col items-center gap-8 text-2xl font-bold">
                <Link 
                  href="/about" 
                  className="hover:text-[#7C3AED] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  技術概要
                </Link>
                <Link 
                  href="/philosophy" 
                  className="hover:text-[#7C3AED] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  フィロソフィー
                </Link>
                <button 
                  onClick={() => {
                    setView("input");
                    setIsMenuOpen(false);
                  }}
                  className="px-8 py-4 rounded-full font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                  style={{ 
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  }}
                >
                  今すぐ始める
                </button>
              </nav>

              <div className="absolute bottom-10 text-sm text-gray-400 font-mono">
                ZAX PROTOCOL v2.0
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </main>
  );
}
