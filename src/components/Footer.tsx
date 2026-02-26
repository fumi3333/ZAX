"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-bold text-xl tracking-tighter">ZAX</Link>
          <div className="text-[10px] text-slate-400 tracking-widest uppercase">
            &copy; 2026 ZAX
          </div>
        </div>
        
        <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="/terms" className="hover:text-black transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-black transition-colors">プライバシーポリシー</Link>
          <Link href="/about" className="hover:text-black transition-colors">私たちについて</Link>
        </div>
      </div>
    </footer>
  );
}
