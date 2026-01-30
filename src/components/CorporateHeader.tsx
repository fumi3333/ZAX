"use client";

import Link from "next/link";

export default function CorporateHeader() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-[80px] z-[100] flex justify-between items-center px-8 md:px-12 bg-[#050505]/90 backdrop-blur-md border-b border-white/10">
            {/* Logo Area */}
            <Link href="/" className="flex items-center gap-3 group">
                {/* Abstract Logo Mark */}
                <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-zax-glow/50 transition-all">
                    <span className="text-black font-extrabold text-lg tracking-tighter">Z</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white leading-none group-hover:text-zax-glow transition-colors">ZAX</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Research Initiative</span>
                </div>
            </Link>

            {/* Global Navigation - Corporate Standard */}
            <div className="hidden lg:flex items-center gap-8">
                <ul className="flex items-center gap-8 text-sm font-bold text-white/80 tracking-wide">
                    <li><Link href="/philosophy" className="hover:text-zax-glow transition-colors py-2 relative group">
                        企業情報
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-zax-glow transition-colors py-2 relative group">
                        ニュース
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-zax-glow transition-colors py-2 relative group">
                        技術・研究
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-zax-glow transition-colors py-2 relative group">
                        サステナビリティ
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-zax-glow transition-colors py-2 relative group">
                        採用
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                    <li><Link href="#" className="hover:text-zax-glow transition-colors py-2 relative group">
                        IR
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zax-glow transition-all group-hover:w-full" />
                    </Link></li>
                </ul>

                <div className="h-6 w-px bg-white/20 mx-2" />

                {/* Start Protocol Button (Compact) */}
                <Link href="/" className="text-xs bg-white text-black hover:bg-zax-glow hover:text-black transition-colors px-6 py-3 rounded-full font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    ENTRY
                </Link>
            </div>

            {/* Mobile Menu Icon (Placeholder) */}
            <div className="lg:hidden p-2 text-white">
                <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-white" />
                    <div className="w-6 h-0.5 bg-white" />
                    <div className="w-6 h-0.5 bg-white" />
                </div>
            </div>
        </nav>
    );
}
