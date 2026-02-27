"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const navLinks = [
  { label: "ABOUT US", href: "/about" },
  { label: "VISION", href: "/philosophy" },
  { label: "PRODUCT", href: "/technology" },
  { label: "YOUR HISTORY", href: "/history" },
];

export default function CorporateHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/40">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
            >
              ZAX
            </Link>

            {/* Hamburger Button — always visible */}
            <button
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-6 lg:px-10 h-16 border-b border-slate-100">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-bold text-slate-900"
              >
                ZAX
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
                aria-label="メニューを閉じる"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-5 text-3xl md:text-5xl font-bold text-slate-900 hover:text-slate-500 tracking-tight transition-colors border-b border-slate-100"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.06, duration: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/history"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-base font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                >
                  無料で履歴解析を開始
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="px-10 md:px-20 lg:px-32 pb-10 text-xs text-slate-400 tracking-wider">
              &copy; 2026 ZAX — Value-Based Connection
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
