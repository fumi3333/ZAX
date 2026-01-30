"use client";

import { motion } from "framer-motion";

export default function VectorTransformationVisual() {
    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden my-12">
            {/* Left Side: Attributes (Rigid Boxes) */}
            <div className="absolute left-10 md:left-20 flex flex-col gap-4 z-10 w-32 md:w-40">
                {["University", "Income", "Title"].map((label, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 1, x: 0, scale: 1 }}
                        whileInView={{
                            opacity: [1, 1, 0],
                            x: [0, 0, 100],
                            scale: [1, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            times: [0, 0.5, 1],
                            repeat: Infinity,
                            repeatDelay: 3 + (i * 0.5),
                            delay: i * 0.5
                        }}
                        className="bg-white/5 border border-white/10 p-3 rounded text-center"
                    >
                        <span className="text-xs text-white/60 font-mono tracking-widest uppercase">{label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Center: Transformation Zone (The Filter) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-[300px] h-[300px] rounded-full border border-white/5 border-dashed relative"
                >
                    <div className="absolute inset-0 bg-zax-glow/5 rounded-full blur-[80px]" />
                </motion.div>
            </div>

            {/* Right Side: Essence (Glowing Orbs / Vectors) */}
            <div className="absolute right-10 md:right-20 z-10 w-32 md:w-40 h-[200px] relative">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-20 h-20"
                        initial={{ opacity: 0, scale: 0, x: -100 }}
                        whileInView={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.8],
                            x: [-50, 0, 50],
                            y: [0, (i - 1) * 50, (i - 1) * 20]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            delay: 2 + (i * 0.5)
                        }}
                    >
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-zax-glow' : i === 1 ? 'bg-zax-accent' : 'bg-white'} shadow-[0_0_20px_currentColor]`} />
                        <div className="w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45" />
                    </motion.div>
                ))}

                {/* Connection Line */}
                <motion.svg className="absolute inset-0 w-full h-full overflow-visible">
                    <motion.path
                        d="M -100 100 Q 50 100 100 50"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 2.5 }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="50%" stopColor="#7000FF" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            </div>

            <div className="absolute bottom-10 text-xs text-zax-muted font-mono tracking-widest opacity-50">
                PROCESSING: ATTRIBUTE_DECONSTRUCTION
            </div>
        </div>
    );
}
