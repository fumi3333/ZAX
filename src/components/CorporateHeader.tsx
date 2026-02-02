"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CorporateHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Menu Items based on User's image reference (Home, About, Feature, Contact)
  const menuItems = [
    { label: "Home", href: "/", sub: "01" },
    { label: "About", href: "/about", sub: "02" },
    { label: "Technology", href: "/technology", sub: "03" },
    { label: "Contact", href: "#", sub: "04" }, 
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full mix-blend-difference text-white px-8 py-6 lg:px-24 lg:py-10 flex items-center justify-between pointer-events-none">
        {/* Logo - Click to Home & Close Menu */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="pointer-events-auto text-5xl font-black tracking-tighter uppercase relative z-50 hover:opacity-70 transition-opacity"
        >
          ZAX
        </Link>

        {/* Big Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="pointer-events-auto relative z-50 group flex flex-col gap-[6px] items-end p-2 cursor-pointer"
        >
          <span className={`block w-10 h-[3px] bg-current transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[9px] bg-white" : "bg-white"}`} />
          <span className={`block w-8 h-[3px] bg-current transition-all duration-300 group-hover:w-10 ${isOpen ? "opacity-0" : "bg-white"}`} />
          <span className={`block w-10 h-[3px] bg-current transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[9px] bg-white" : "bg-white"}`} />
          <span className="text-[10px] font-bold tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full right-0 pt-2 whitespace-nowrap text-white">MENU</span>
        </button>
      </header>

      {/* Full Screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 95% 5%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 95% 5%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 95% 5%)" }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-40 bg-black text-white flex items-center justify-center"
          >
            <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Context/Info */}
              <div className="hidden lg:flex flex-col gap-8 text-neutral-400">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500">Address</h4>
                  <p className="text-sm leading-relaxed">
                    Musashino University<br />
                    Tokyo, Japan
                  </p>
                </div>
                <div className="space-y-2">
                   <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500">Connect</h4>
                    <p className="text-sm">info@zax.dev</p>
                </div>
              </div>

              {/* Right Column: Massive Navigation */}
              <nav className="flex flex-col gap-2">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-6"
                    >
                      <span className="text-xs lg:text-sm font-bold text-neutral-500 tracking-widest group-hover:text-[#0022FF] transition-colors">
                        {item.sub}
                      </span>
                      <span className="text-6xl md:text-8xl font-black tracking-tight text-white group-hover:text-[#0022FF] group-hover:translate-x-4 transition-all duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
