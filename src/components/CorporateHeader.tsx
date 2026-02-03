"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

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
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none' // Let clicks pass through, enable on children
        }}
      >
        {/* Logo Container */}
        <div style={{ pointerEvents: 'auto' }}>
           <Link href="/" className="block relative" style={{ width: '200px', height: '60px' }}>
              <Image 
                src="/zax-logo-network.jpg" 
                alt="ZAX" 
                fill
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
                priority
              />
           </Link>
        </div>
          
        {/* Hamburger Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ 
            pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <X size={32} color="#1A1A1A" strokeWidth={1.5} />
          ) : (
            <Menu size={32} color="#1A1A1A" strokeWidth={1.5} />
          )}
        </button>
      </header>

      {/* Fullscreen Menu Overlay - Right Side Drawer */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  zIndex: 2000,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(5px)'
                }}
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{ 
                  position: 'fixed', 
                  top: 0, 
                  right: 0, 
                  bottom: 0, 
                  zIndex: 9999,
                  width: 'min(500px, 100vw)',
                  background: '#FFFFFF',
                  boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    padding: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <X size={40} color="#1A1A1A" strokeWidth={1.5} />
                </button>

                <nav className="flex flex-col gap-10">
                  <Link 
                    href="/about" 
                    className="text-5xl font-black text-[#1A1A1A] hover:text-[#7C3AED] transition-colors tracking-tighter"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link 
                    href="/philosophy" 
                    className="text-5xl font-black text-[#1A1A1A] hover:text-[#0EA5E9] transition-colors tracking-tighter"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Philosophy
                  </Link>
                  <Link 
                    href="/product" 
                    className="text-5xl font-black text-[#1A1A1A] hover:text-[#10B981] transition-colors tracking-tighter"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Product
                  </Link>
                  
                  <div className="w-full h-px bg-gray-200 my-6" />
                  
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-10 py-5 rounded-full font-bold text-xl text-white text-center w-fit shadow-lg block hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
                  >
                    今すぐ始める
                  </Link>
                </nav>

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
