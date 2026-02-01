"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    label: "企業",
    labelEn: "Corporate",
    href: "/about",
    children: [
      { label: "私たちの想い", href: "/about" },
      { label: "哲学", href: "/philosophy" },
    ],
  },
  {
    label: "技術",
    labelEn: "Technology",
    href: "/technology",
    children: [
      { label: "アーキテクチャ", href: "/technology" },
      { label: "6次元ベクトル", href: "/technology" },
    ],
  },
  {
    label: "採用・研究",
    labelEn: "Careers",
    href: "#",
    children: [
      { label: "研究機関向け", href: "#" },
      { label: "お問い合わせ", href: "#" },
    ],
  },
];

export default function CorporateHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 text-xl lg:text-2xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
            >
              ZAX
            </Link>

            {/* Desktop Navigation - CyberAgent style horizontal nav */}
            <nav
              className="hidden lg:flex items-center gap-1"
              onMouseLeave={() => setActiveMenu(null)}
            >
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.label)}
                >
                  <Link
                    href={item.href}
                    className="flex flex-col px-4 py-5 text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {item.labelEn}
                    </span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </Link>

                  <AnimatePresence>
                    {activeMenu === item.label && item.children && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-1"
                      >
                        <div className="bg-white rounded-lg shadow-xl border border-slate-200/80 py-2 min-w-[200px]">
                          {item.children.map((child) => (
                            <Link
                              key={child.href + child.label}
                              href={child.href}
                              className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* CTA - 診断を始める */}
              <Link
                href="/"
                className="ml-4 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-colors"
              >
                診断を始める
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

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] pt-24 px-8 lg:hidden"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-4 text-lg font-bold text-slate-800 border-b border-slate-100"
                  >
                    {item.label}
                  </Link>
                  {item.children?.map((c) => (
                    <Link
                      key={c.href + c.label}
                      href={c.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 pl-6 text-slate-600"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block mt-6 py-4 text-center bg-slate-900 text-white font-bold rounded-xl"
              >
                診断を始める
              </Link>
            </div>
            <button
              className="absolute top-8 right-8 p-2 text-sm font-bold text-slate-600"
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
