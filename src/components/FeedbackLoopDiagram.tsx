"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, RefreshCcw, Sparkles, UserCheck, MessageSquare } from "lucide-react";

export default function FeedbackLoopDiagram() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const arrowVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-1 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5 items-center justify-center w-full">
          
          {/* Step 1 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-1.5">
              <UserCheck size={18} />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-0.5">マッチング</h3>
            <p className="text-[10px] text-slate-500">価値観ベクトルによる結合</p>
          </motion.div>

          <motion.div variants={arrowVariants} className="hidden md:flex justify-center text-slate-300">
            <ArrowRight size={18} />
          </motion.div>
          
          {/* Step 2 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-1.5">
              <MessageSquare size={18} />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-0.5">対話・交流</h3>
            <p className="text-[10px] text-slate-500">ブラインドでの共鳴</p>
          </motion.div>

          <motion.div variants={arrowVariants} className="hidden md:flex justify-center text-slate-300">
            <ArrowRight size={18} />
          </motion.div>
          
          {/* Step 3 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center mb-1.5">
              <RefreshCcw size={18} />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-0.5">フィードバック</h3>
            <p className="text-[10px] text-slate-500">対話結果から学習</p>
          </motion.div>

        </div>

        {/* Loop Back Arrow for Desktop */}
        <motion.div 
          variants={arrowVariants} 
          className="hidden md:block w-full max-w-2xl mt-1.5 relative h-8"
        >
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-2.5 py-0.5 text-[9px] font-bold text-slate-600 flex items-center gap-1 rounded-full border border-slate-200">
            <Sparkles size={10} className="text-slate-800" />
            精度向上ループ
            <Sparkles size={10} className="text-slate-800" />
          </div>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="mt-2 text-[11px] text-slate-500 max-w-lg text-center leading-relaxed"
        >
          マッチングとフィードバックを繰り返すことでシステムが学習。
          <br />回数を重ねるごとに、<span className="font-bold text-slate-900">本当に波長の合う相手とのつながり</span>の精度が高まります。
        </motion.p>
      </motion.div>
    </div>
  );
}
