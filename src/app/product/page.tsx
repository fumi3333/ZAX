"use client";

import { motion } from "framer-motion";
import { Brain, Network, GitMerge, RefreshCw, MousePointer2, ArrowRight, ShieldCheck, Database, Zap } from "lucide-react";
import Link from "next/link";

export default function ProductPage() {
  const logicSections = [
    {
        id: "01",
        title: "Philosophical Foundation",
        subtitle: "静的属性から、動的意志へ",
        desc: "既存のAIは「学習完了」で成長が止まりますが、ZAXは「Frozen to Fluid（凍結から流動へ）」を掲げます。学歴や年収といった過去のラベル（属性）ではなく、今の心境と変化への期待（意志）をトリガーに、ユーザーの「長期的な幸福最大化」を目的関数として計算し続けます。",
        icon: Brain,
        tag: "PARADIGM SHIFT"
    },
    {
        id: "02",
        title: "3-Layer Evolutionary Model",
        subtitle: "三層進化アーキテクチャ",
        desc: (
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Layer 1: Immutable Core</strong> - 幸福最大化を固定した不動の基盤。</li>
                <li><strong>Layer 2: Evolutionary Merge</strong> - 数学・芸術などの専門知能を動的にマージ。</li>
                <li><strong>Layer 3: Delta Adapter</strong> - 日記や生体反応を「Δ（デルタ）」として数ミリ秒で自己更新。</li>
            </ul>
        ),
        icon: Network,
        tag: "SYSTEM ARCHITECTURE"
    },
    {
        id: "03",
        title: "The Evolutionary Loop",
        subtitle: "進化の循環サイクル",
        desc: (
            <div className="flex flex-col gap-3 mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span> <span><strong>Interaction:</strong> 学生間の深い対話と交流</span></div>
                <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span> <span><strong>Extraction:</strong> 感情変化から「差分(Δ)」を抽出</span></div>
                <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</span> <span><strong>Merging:</strong> 明日のモデルへ重みを反映</span></div>
            </div>
        ),
        icon: RefreshCw,
        tag: "CORE MECHANISM"
    },
    {
        id: "04",
        title: "Social Swarm Intelligence",
        subtitle: "モデル間相互学習",
        desc: "個別のモデルが孤立せず、成功体験（メタデータ）を共有。「この二人が話せばポジティブな変化が起きるか」を接続前に数千回シミュレーションし、人類全体の幸福の法則を解明する分散型知能として機能します。",
        icon: GitMerge,
        tag: "COLLECTIVE AI"
    },
    {
        id: "05",
        title: "Phase 1 Roadmap",
        subtitle: "2026.04 - Launch",
        desc: (
            <ul className="space-y-4 mt-4">
                <li className="flex gap-4 items-start">
                    <span className="font-mono font-bold text-indigo-600 text-sm mt-1">PHASE 1</span> 
                    <span className="text-slate-600"><strong>武蔵野大学限定ローンチ。</strong><br/>RAG × Vector DBによる「魂の種」の蓄積を開始。</span>
                </li>
                <li className="flex gap-4 items-start">
                    <span className="font-mono font-bold text-indigo-600 text-sm mt-1">PHASE 2</span> 
                    <span className="text-slate-600"><strong>局所的マージの導入。</strong><br/>週次でモデルがパーソナライズされ始める。</span>
                </li>
                <li className="flex gap-4 items-start">
                    <span className="font-mono font-bold text-indigo-600 text-sm mt-1">PHASE 3</span> 
                    <span className="text-slate-600"><strong>完全なボトムアップAGIへ。</strong></span>
                </li>
            </ul>
        ),
        icon: MousePointer2,
        tag: "ACTION PLAN"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-slate-100 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-block px-4 py-1 mb-6 border border-slate-200 rounded-full font-mono text-xs font-bold text-slate-500 bg-slate-50">
                    ZAX / LOGIC / v1.0
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8">
                    The Logic of<br/>Resonance.
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                    直感的な「運命」の裏側には、緻密な計算があります。<br/>
                    ZAXが採用する、最新の認知的アーキテクチャについて。
                </p>
            </motion.div>
        </div>

        {/* Ambient Bg */}
        <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-slate-50 rounded-full blur-[120px] -z-10" />
      </section>

      {/* 2. Logic Bento Grid */}
      <section className="py-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 1. Philosophy (Large Main) */}
            <motion.div 
                className="col-span-1 md:col-span-8 bg-white rounded-[32px] p-10 md:p-14 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase">
                        <Brain size={12} />
                        01 Paradigm
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                        Frozen to Fluid.
                    </h2>
                    <h3 className="text-xl font-bold text-indigo-600 mb-6">静的属性から、動的意志へ</h3>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        既存のAIは「学習完了」で成長が止まりますが、ZAXは<span className="text-slate-900 font-bold underline decoration-indigo-300 decoration-2 underline-offset-4">「意志」を学習し続けます。</span><br/>
                        学歴や年収といった過去のラベルではなく、「今の心境」と「変化への期待」をトリガーに、あなたの幸福最大化を計算し続ける、世界初の流動的知能です。
                    </p>
                </div>
            </motion.div>

            {/* 2. Architecture (Tall Side) */}
            <motion.div 
                className="col-span-1 md:col-span-4 bg-slate-900 rounded-[32px] p-10 border border-slate-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
            >
                 <div>
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold tracking-widest uppercase border border-white/5">
                        <Network size={12} />
                        02 System
                    </div>
                    <h2 className="text-3xl font-bold mb-2">3-Layer Model</h2>
                    <p className="text-slate-400 text-sm mb-8">三層進化アーキテクチャ</p>
                    
                    <ul className="space-y-6">
                        <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                            <strong className="block text-white text-lg mb-1">Layer 1: Core</strong>
                            <span className="text-slate-400 text-sm">幸福最大化を固定した不動の基盤。</span>
                        </li>
                        <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full">
                            <strong className="block text-white text-lg mb-1">Layer 2: Merge</strong>
                            <span className="text-slate-400 text-sm">専門知能を動的にマージ。</span>
                        </li>
                        <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                            <strong className="block text-white text-lg mb-1">Layer 3: Delta</strong>
                            <span className="text-slate-400 text-sm">数ミリ秒で自己更新するΔ層。</span>
                        </li>
                    </ul>
                 </div>
                 <div className="absolute bottom-[-20px] right-[-20px] opacity-10">
                    <Network size={160} strokeWidth={0.5} />
                 </div>
            </motion.div>

            {/* 3. Loop (Wide Process) */}
            <motion.div 
                className="col-span-1 md:col-span-12 bg-indigo-600 rounded-[32px] p-10 md:p-16 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
            >
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                            <RefreshCw size={12} />
                            03 Mechanism
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">The Evolutionary Loop</h2>
                        <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-lg">
                            出会い、対話し、感情が動く。<br/>
                            そのすべてが「教師データ」となり、<br/>
                            夜間にモデルが再構築される循環。
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { num: "01", label: "Interaction", desc: "対話による交流" },
                            { num: "02", label: "Extraction", desc: "差分(Δ)の抽出" },
                            { num: "03", label: "Merging", desc: "モデルへの結合" },
                        ].map((step, i) => (
                           <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                                <div className="text-3xl font-black opacity-30 mb-2">{step.num}</div>
                                <div className="text-lg font-bold mb-1">{step.label}</div>
                                <div className="text-xs opacity-70">{step.desc}</div>
                           </div> 
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 4. Swarm (Half) */}
            <motion.div 
                className="col-span-1 md:col-span-6 bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
            >
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest uppercase border border-blue-100">
                    <GitMerge size={12} />
                    04 Collective
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Social Swarm Intelligence</h2>
                <h3 className="text-lg font-bold text-slate-500 mb-6">モデル間相互学習</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                    あなたのAIは孤立していません。<br/>
                    「この二人が話せばどんな化学反応が起きるか？」を、接続前にAI同士が数千回シミュレーション。<br/>
                    人類全体の幸福の最適解を探索する、分散型知能ネットワークです。
                </p>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-blue-500 group-hover:w-full transition-all duration-1000 ease-out" />
                </div>
            </motion.div>

            {/* 5. Roadmap (Half) */}
            <motion.div 
                className="col-span-1 md:col-span-6 bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
            >
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold tracking-widest uppercase border border-amber-100">
                    <MousePointer2 size={12} />
                    05 Roadmap
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Phase 1: Launch</h2>
                <h3 className="text-lg font-bold text-slate-500 mb-8">2026.04 - Musashino Univ.</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">Limited Launch (Campus Sandbox)</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
                         <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                         <span className="text-sm font-bold text-slate-500">Weekly Delta Updates</span>
                    </div>
                </div>
            </motion.div>

        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-32 bg-slate-900 text-center px-6">
        <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                Experience the logic.
            </h2>
            <Link href="/" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                <span>Start Prototype</span>
                <ArrowRight size={20} />
            </Link>
        </div>
      </section>

    </div>
  );
}
