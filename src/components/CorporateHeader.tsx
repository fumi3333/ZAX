"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const navLinks = [
  { label: "ABOUT US", href: "/about" },
  { label: "VISION", href: "/philosophy" },
  { label: "PRODUCT", href: "/technology" },
];

export default function CorporateHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-slate-500 hover:text-slate-900 tracking-wide transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="px-5 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                無料で始める
              </Link>
            </nav>

            {/* Mobile */}
            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="メニュー"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
              <span className="text-xl font-bold text-slate-900">ZAX</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700">
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col px-6 pt-8 gap-1">
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
                className="mt-8 py-3 text-center bg-slate-900 text-white font-semibold rounded-lg"
              >
                無料で始める
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
