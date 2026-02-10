"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ShieldCheck, Network, Cpu } from "lucide-react";

export default function CorporateHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Header - Robust Fixed Layout */}
      <header 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          padding: '16px 30px', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          
          /* Modern Glass Header */
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease'
        }}
        className="group"
      >
        {/* Gradient Line (Bottom Accent) */}
        <div 
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)', // Indigo-500 with fade
                opacity: 1
            }} 
        />

        {/* Logo Container */}
        <div style={{ pointerEvents: 'auto' }}>
           <Link href="/" className="block relative" style={{ width: '160px', height: '48px' }}>
              <Image 
                src="/zax-logo-network.jpg" 
                alt="ZAX" 
                fill
                style={{ objectFit: 'contain', objectPosition: 'left center', mixBlendMode: 'multiply' }}
                priority
              />
           </Link>
        </div>
          
        {/* Hamburger Menu Button - Clean Style */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:bg-slate-100/50 transition-colors"
          style={{ 
            pointerEvents: 'auto',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
          }}
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <X size={24} className="text-slate-900" />
          ) : (
            <Menu size={24} className="text-slate-900" />
          )}
        </button>
      </header>

      {/* Fullscreen Menu Overlay */}
{mounted && createPortal(
  <AnimatePresence>
    {isMenuOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ 
          position: 'fixed', 
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // White with transparency
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Ambient Glow (Light Mode) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-100/50 rounded-full blur-[120px] pointer-events-none" />

        {/* Close Button - Fixed Top Right */}
        {/* Close Button - Fixed Top Right (Matching Header Position) */}
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="group"
          style={{
            position: 'absolute',
            top: '16px', 
            right: '30px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            zIndex: 2050,
            cursor: 'pointer'
          }}
        >
          <div className="relative">
             <div className="absolute inset-0 bg-slate-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
             <X size={24} className="text-slate-900 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </button>

        {/* Navigation Container */}
        <motion.nav 
            className="flex flex-col items-center gap-12 relative z-10 w-full max-w-5xl px-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
            }}
        >
          {/* VAR 1: Classic Ghost (Border -> Fill) */}
          <NavigationItem 
            item={{ href: '/about', label: 'Vision', desc: 'なぜ「内面」なのか', num: '01' }} 
            setIsMenuOpen={setIsMenuOpen} 
            variant="classic"
          />
          <NavigationItem 
            item={{ href: '/product', label: 'Logic', desc: 'マッチングの仕組み', num: '02' }} 
            setIsMenuOpen={setIsMenuOpen} 
            variant="classic"
          />

          {/* VAR 2: Neon Ghost (Border -> Glow) */}
          <NavigationItem 
            item={{ href: 'https://note.com', label: 'Insights', desc: '開発ログ (note)', num: '03', external: true }} 
            setIsMenuOpen={setIsMenuOpen} 
            variant="neon"
          />

          {/* VAR 3: Minimal Ghost (No Border -> Reveal) */}
          <NavigationItem 
            item={{ href: '/trust', label: 'Trust & Safety', desc: '安心・安全', num: '04' }} 
            setIsMenuOpen={setIsMenuOpen} 
            variant="minimal"
          />
          <NavigationItem 
            item={{ href: '/feedback', label: 'Feedback', desc: '共創・お問い合わせ', num: '05' }}
            setIsMenuOpen={setIsMenuOpen} 
            variant="minimal"
          />
          
          <motion.div 
            className="w-full h-px bg-slate-200 my-8"
            variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.8 } } }}
          />
          
          <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
          >
            <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="group relative inline-flex items-center gap-4 px-12 py-4 rounded-full border border-slate-900 text-slate-900 font-bold text-lg hover:bg-slate-900 hover:text-white transition-all duration-300"
            >
                <span>DEMO LAUNCH</span>
                <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.nav>

      </motion.div>
    )}
  </AnimatePresence>,
  document.body
)}
    </>
  );
}

function NavigationItem({ item, setIsMenuOpen, variant = "classic" }: { item: any, setIsMenuOpen: (open: boolean) => void, variant?: "classic" | "neon" | "minimal" }) {
    // VARIANT STYLES
    const baseStyles = "group relative w-full h-20 flex items-center justify-center gap-4 px-8 transition-all duration-300 cursor-pointer overflow-hidden";
    
    // 1. Classic: Border -> Fill Black
    const classicStyles = "border border-slate-200 hover:border-slate-900 hover:bg-slate-900 rounded-full hover:shadow-xl";
    const classicText = "text-slate-900 group-hover:text-white";
    const classicSub = "text-slate-400 group-hover:text-slate-300";

    // 2. Neon: Border -> Indigo Glow
    const neonStyles = "border border-slate-200 hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] rounded-full bg-white";
    const neonText = "text-slate-900 group-hover:text-indigo-600";
    const neonSub = "text-slate-400 group-hover:text-indigo-400";

    // 3. Minimal: No Border -> Border & Scale
    const minimalStyles = "border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-full";
    const minimalText = "text-slate-900 group-hover:scale-105 transition-transform";
    const minimalSub = "text-slate-400";

    let containerClass = baseStyles;
    let textClass = "";
    let subClass = "";

    if (variant === "classic") {
        containerClass = `${baseStyles} ${classicStyles}`;
        textClass = classicText;
        subClass = classicSub;
    } else if (variant === "neon") {
        containerClass = `${baseStyles} ${neonStyles}`;
        textClass = neonText;
        subClass = neonSub;
    } else {
        containerClass = `${baseStyles} ${minimalStyles}`;
        textClass = minimalText;
        subClass = minimalSub;
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className="w-full"
        >
            <Link 
                href={item.href} 
                onClick={() => setIsMenuOpen(false)}
                target={item.external ? "_blank" : undefined}
                className={containerClass}
            >
                <div className="flex flex-col items-center justify-center relative z-10 text-center">
                    <span className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-1 ${subClass}`}>
                        {item.num} / {item.desc}
                    </span>
                    <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${textClass}`}>
                        {item.label}
                    </h2>
                </div>
                
                {item.external ? (
                    <ArrowRight size={24} className={`relative z-10 transition-colors duration-300 ${textClass}`} />
                ) : (
                    <ArrowRight size={24} className={`relative z-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${textClass}`} />
                )}
            </Link>
        </motion.div>
    );
}
