"use client";

import { motion } from "framer-motion";
import { Brain, Network, GitMerge, RefreshCw } from "lucide-react";

export default function ProductPage() {
  const steps = [
    {
      id: "01",
      title: "Vector Embedding",
      subtitle: "高次元ベクトル化",
      role: "LLM (Semantic Layer)",
      description: "ユーザーの基本属性、SNSでの発信内容、ZAX独自の質問に対する「コンテキスト（文脈）」をLLMが解析。言語化された情報を数千次元の数値データ（ベクトル）に変換し、ユーザーを潜在空間上の「座標」として定義します。",
      icon: Brain,
      color: "#A78BFA"
    },
    {
      id: "02",
      title: "Hypothesis-Driven Matching",
      subtitle: "仮説検証型マッチング",
      role: "Algorithm (Optimization Layer)",
      description: "ベクトル空間上の距離計算に基づき、アルゴリズムが「この二人は長期的な関係性を築ける可能性がある」という仮説（Hypothesis）を生成してマッチングを実行します。ここでは既知の相性だけでなく、未知の化学反応を期待する探索的な組み合わせも行われます。",
      icon: Network,
      color: "#38BDF8"
    },
    {
      id: "03",
      title: "Feedback Loop & Deep Learning",
      subtitle: "深層学習への還流",
      role: "Model Training",
      description: "マッチング後のユーザーからのフィードバック（定量的評価＋定性的コンテキスト）を収集します。",
      details: [
        { label: "Input", value: "マッチング前の両者のベクトルデータ" },
        { label: "Output", value: "実際の相互作用の結果（良/悪、およびその理由）" },
        { label: "Effect", value: "これを教師データ（Ground Truth）としてアルゴリズムに再学習させ、「どのようなベクトル同士の組み合わせが成功するか」という予測精度を継続的に向上させます。" }
      ],
      icon: GitMerge,
      color: "#34D399"
    },
    {
      id: "04",
      title: "Dynamic Identity Update",
      subtitle: "動的更新",
      role: "Vector Database",
      description: "フィードバックや経験を通じて得られた変化を、ユーザー個人のベクトルデータに「差分（Delta）」として書き加えます。これにより、ZAXは「過去のあなた」ではなく、「変容し続ける現在のあなた」を常に学習し続けます。",
      icon: RefreshCw,
      color: "#FBBF24"
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080C] font-sans text-white selection:bg-indigo-500/30 selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      <div className="relative z-10 pt-40 pb-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 text-center md:text-left"
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold tracking-[0.3em] backdrop-blur-sm">
            SYSTEM ARCHITECTURE
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Learning Loop
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed font-light text-slate-400 max-w-4xl">
            ZAXは、静的なマッチングを行うツールではなく、<br className="hidden md:block" />
            ユーザーの相互作用（Interaction）を通じて自律的に学習し、<br className="hidden md:block" />
            精度を高め続ける動的なエコシステムです。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[10%] bottom-[10%] left-1/2 w-px bg-white/10 -translate-x-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.2 }}
              className={`relative ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:mt-48"}`}
            >
              {/* Dot on line */}
              <div 
                className={`hidden md:flex absolute top-12 w-4 h-4 rounded-full border-4 border-[#08080C] shadow-[0_0_15px_rgba(255,255,255,0.3)] items-center justify-center z-10
                  ${i % 2 === 0 ? "right-[-8px] translate-x-1/2" : "left-[-8px] -translate-x-1/2"}`}
                style={{ backgroundColor: step.color }}
              />

              <div className="group relative p-8 md:p-12 rounded-[2rem] bg-[#0A0A10]/80 border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-white/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className={`relative z-10 mb-8 flex items-center gap-4 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg"
                    style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}40` }}
                  >
                    <step.icon size={32} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold tracking-widest text-slate-500 mb-1">{step.id}</div>
                    <div className="text-xs font-mono font-bold tracking-wider uppercase" style={{ color: step.color }}>{step.role}</div>
                  </div>
                </div>

                <h3 className="relative z-10 text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">{step.title}</h3>
                <h4 className="relative z-10 text-lg font-bold text-slate-500 mb-6">{step.subtitle}</h4>
                
                <p className="relative z-10 text-base leading-loose text-slate-400 font-medium mb-6">
                  {step.description}
                </p>

                {step.details && (
                  <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className={`text-sm ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block mb-1">{detail.label}</span>
                        <span className="block text-slate-300 font-medium">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
