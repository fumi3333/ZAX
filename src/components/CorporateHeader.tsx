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
            style={{ backgroundColor: navBackground }}
            className="fixed top-0 left-0 right-0 h-[80px] z-[100] flex justify-between items-center px-8 md:px-12 backdrop-blur-md border-b border-slate-200 transaction-all"
        >
            {/* Logo Area */}
            <motion.div style={{ opacity: logoOpacity, y: logoY, pointerEvents: "auto" }}>
                <Link href="/" className="flex items-center gap-3 group">
                    {/* Abstract Logo Mark */}
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all">
                        <span className="text-white font-extrabold text-lg tracking-tighter">Z</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors">ZAX</span>
                        <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Research Initiative</span>
                    </div>
                </Link>
            </motion.div>

            {/* Global Navigation - Corporate Standard */}
            <div className="hidden lg:flex items-center gap-8">
                <ul className="flex items-center gap-8 text-sm font-bold text-slate-600 tracking-wide">
                    <li><Link href="/about" className="hover:text-blue-600 transition-colors py-2 relative group">
                        ABOUT US
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-blue-600 transition-colors py-2 relative group">
                        NEWS
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-blue-600 transition-colors py-2 relative group">
                        PROJECT
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="/technology" className="hover:text-blue-600 transition-colors py-2 relative group">
                        TECHNOLOGY
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-blue-600 transition-colors py-2 relative group">
                        SUSTAINABILITY
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-blue-600 transition-colors py-2 relative group">
                        RECRUIT
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-blue-600 transition-colors py-2 relative group">
                        IR
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                    </Link></li>
                </ul>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* Start Protocol Button (Hanging Tag Style) */}
                <div className="absolute top-0 right-[6%] h-full flex items-start z-[110]">
                    <Link
                        href="/"
                        className="h-[70px] w-[140px] bg-slate-900 text-white hover:bg-blue-600 rounded-b-2xl shadow-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:h-[85px] hover:shadow-blue-900/20 group"
                    >
                        <span className="text-[10px] font-medium tracking-widest text-slate-400 group-hover:text-blue-200 transition-colors">START</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-widest">ENTRY</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Icon */}
            <button
                className="lg:hidden p-2 text-slate-900 z-[120]"
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
                            <li><Link href="/technology" onClick={() => setIsMobileMenuOpen(false)}>TECHNOLOGY</Link></li>
                            <li><Link href="#" className="opacity-50">NEWS</Link></li>
                            <li><Link href="#" className="opacity-50">PROJECT</Link></li>
                            <li><Link href="#" className="opacity-50">SUSTAINABILITY</Link></li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
