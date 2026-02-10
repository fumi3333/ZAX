"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function VectorTransformationVisual() {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden my-12 bg-white border border-[#E5E5E5]">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-40" 
                style={{ backgroundImage: 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />

            <div className="relative z-10 flex items-center gap-4 lg:gap-12 w-full max-w-4xl px-8">
                
                {/* 1. INPUT NODE */}
                <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">INPUT_SIGNALS</span>
                     <div className="flex flex-col gap-2 w-full">
                        {["Universities", "Income", "Jobs"].map((label, i) => (
                           <motion.div 
                             key={i}
                             initial={{x:-20, opacity:0}}
                             whileInView={{x:0, opacity:1}}
                             transition={{delay:i*0.2}}
                             className="bg-[#F9F9F9] border border-[#E5E5E5] p-2 text-center text-xs text-black font-mono uppercase tracking-wider shadow-[2px_2px_0px_#E5E5E5]"
                           >
                             {label}
                           </motion.div>
                        ))}
                     </div>
                </div>

                {/* 2. PROCESS NODE (Center) */}
                <div className="relative flex items-center justify-center shrink-0">
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                       className="w-24 h-24 lg:w-32 lg:h-32 border border-[#E5E5E5] rounded-full border-dashed flex items-center justify-center relative bg-white"
                    >
                         <div className="absolute inset-0 border border-[#0022FF]/20 rounded-full scale-75" />
                    </motion.div>
                    <ArrowRight className="absolute text-black w-6 h-6" />
                </div>

                {/* 3. OUTPUT NODE */}
                 <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">ESSENCE_VECTOR</span>
                     <div className="bg-white border border-[#0022FF] w-full h-32 relative overflow-hidden p-4 group shadow-[4px_4px_0px_#E5E5E5]">
                        <div className="absolute inset-0 bg-[#0022FF]/5 group-hover:bg-[#0022FF]/10 transition-colors" />
                        {/* Simulated Tensor Data */}
                        <div className="grid grid-cols-3 gap-2 h-full content-center">
                           {[...Array(9)].map((_,i) => (
                               <motion.div 
                                 key={i}
                                 animate={{opacity: [0.3, 1, 0.3], height: ["2px", "4px", "2px"]}}
                                 transition={{duration: 1.5, delay: i*0.1, repeat: Infinity}}
                                 className="bg-[#0022FF] w-full rounded-full"
                               />
                           ))}
                        </div>
                     </div>
                </div>

            </div>
            
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-400">
                PIPELINE_STATUS: ACTIVE
            </div>
        </div>
    );
}

