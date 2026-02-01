"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CorporateHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "ABOUT US", href: "/about" },
    { label: "機能紹介", href: "#features" },
    { label: "技術", href: "/technology" },
  ];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 text-xl lg:text-2xl font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
            >
              ZAX
            </Link>

            {/* Desktop Navigation - SaaS style text links */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="ml-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                無料で始める
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -mr-2 text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニュー"
            >
              <div className="space-y-1.5">
                <div className="w-6 h-0.5 bg-slate-900 rounded" />
                <div className="w-6 h-0.5 bg-slate-900 rounded" />
                <div className="w-6 h-0.5 bg-slate-900 rounded" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] pt-24 px-8 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 text-lg font-medium text-slate-800 border-b border-slate-100"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-6 py-4 text-center bg-slate-900 text-white font-semibold rounded-xl"
              >
                無料で始める
              </Link>
            </div>
            <button
              className="absolute top-6 right-8 p-2 text-sm font-semibold text-slate-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              閉じる
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
