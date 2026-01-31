"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

export default function CorporateHeader() {
    const { scrollY } = useScroll();
    const logoOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const logoY = useTransform(scrollY, [0, 100], [0, -20]);
    const navBackground = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.8)"]);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 w-full flex justify-between items-center px-10 py-4 backdrop-blur-md bg-white/70 z-50 border-b border-white/50 shadow-sm"
        >
            {/* Logo Area */}
            <div className="logo">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">ZAX</span>
                </Link>
            </div>

            {/* Global Navigation - Simplified as Requested */}
            <nav className="hidden lg:block">
                <ul className="flex gap-8 text-sm font-bold text-slate-700">
                    <li className="relative group">
                        <Link href="/about" className="cursor-pointer font-bold hover:text-blue-600 transition-colors">ABOUT US</Link>
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </li>
                </ul>
            </nav>

            {/* Mobile Menu Icon (kept for functionality) */}
            <button
                className="lg:hidden p-2 text-slate-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <div className="space-y-1.5">
                    <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                        className="w-6 h-0.5 bg-slate-900"
                    />
                    <motion.div
                        animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                        className="w-6 h-0.5 bg-slate-900"
                    />
                    <motion.div
                        animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                        className="w-6 h-0.5 bg-slate-900"
                    />
                </div>
            </button>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white z-[110] pt-32 px-8 flex flex-col"
                    >
                        <ul className="flex flex-col gap-6 text-2xl font-bold text-slate-900 tracking-tight">
                            <li><Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>ABOUT US</Link></li>
                            <li><Link href="#" className="opacity-50" onClick={() => setIsMobileMenuOpen(false)}>NEWS</Link></li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
