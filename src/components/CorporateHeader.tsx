"use client";

import Link from "next/link";

export default function CorporateHeader() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-[80px] z-[100] flex justify-between items-center px-8 md:px-12 bg-white/90 backdrop-blur-md border-b border-slate-200">
            {/* Logo Area */}
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

            {/* Global Navigation - Corporate Standard */}
            <div className="hidden lg:flex items-center gap-8">
                <ul className="flex items-center gap-8 text-sm font-bold text-slate-600 tracking-wide">
                    <li><Link href="/about" className="hover:text-blue-600 transition-colors py-2 relative group">
                        ABOUT JS
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

                {/* Start Protocol Button (Compact) */}
                <Link href="/" className="text-xs bg-slate-900 text-white hover:bg-blue-600 transition-colors px-6 py-3 rounded-full font-bold tracking-widest uppercase shadow-lg">
                    ENTRY
                </Link>
            </div>

            {/* Mobile Menu Icon (Placeholder) */}
            <div className="lg:hidden p-2 text-slate-900">
                <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-slate-900" />
                    <div className="w-6 h-0.5 bg-slate-900" />
                    <div className="w-6 h-0.5 bg-slate-900" />
                </div>
            </div>
        </nav>
    );
}
