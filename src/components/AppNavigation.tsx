'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/lib/actions/manual-auth';

export default function AppNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Simple breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/philosophy', label: 'Vision' },
    { href: '/technology', label: 'Product' },
    { href: '/history', label: 'Your History' },
  ];
  
  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-slate-900">
                ZAX
              </Link>
            </div>

            {/* Menu button — Always visible */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-slate-700 hover:text-black transition-colors"
                aria-label="メニューを開く"
              >
                <Menu size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs - only show when not on home, and hide on result pages with UUIDs */}
        {pathSegments.length > 0 && !pathname.includes('/result/') && (
          <div className="border-b border-black">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2 text-[10px] sm:text-xs text-black overflow-x-auto whitespace-nowrap uppercase tracking-widest font-bold">
                <Link href="/" className="hover:bg-black hover:text-white px-2 py-1 transition-colors">HOME</Link>
                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <span key={segment}>
                            <span className="mx-2">/</span>
                            <Link href={href} className={index === pathSegments.length - 1 ? "font-black text-black px-2 py-1 bg-gray-100" : "hover:bg-black hover:text-white px-2 py-1 transition-colors"}>
                                {segment.replace('-', ' ')}
                            </Link>
                        </span>
                    );
                })}
            </div>
          </div>
        )}
      </nav>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Overlay Header */}
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
                className="p-2 text-slate-700 hover:text-black transition-colors"
                aria-label="メニューを閉じる"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32 bg-slate-50/30">
              <div className="space-y-1 sm:space-y-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-4 sm:py-6 px-4 text-3xl sm:text-5xl font-black transition-all ${
                        pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                          ? 'text-white bg-black'
                          : 'text-black bg-transparent border-2 border-transparent hover:border-black hover:bg-black hover:text-white'
                      } tracking-tighter`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + navLinks.length * 0.05 }}
                    className="mt-8 pt-6 border-t border-slate-200/60"
                 >
                    <form action={logout}>
                      <button
                        type="submit"
                        className="block py-4 px-4 text-xl sm:text-2xl font-bold text-slate-400 hover:text-red-500 transition-colors tracking-widest uppercase"
                      >
                        Sign out
                      </button>
                    </form>
                 </motion.div>
              </div>
            </nav>

            {/* Footer */}
            <div className="px-10 md:px-20 lg:px-32 pb-10 pt-6 text-[10px] text-slate-400 tracking-widest uppercase">
              &copy; 2026 ZAX
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
