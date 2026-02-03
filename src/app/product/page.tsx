"use client";

import { motion } from "framer-motion";
import CorporateHeader from "@/components/CorporateHeader";
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
      color: "#7C3AED"
    },
    {
      id: "02",
      title: "Hypothesis-Driven Matching",
      subtitle: "仮説検証型マッチング",
      role: "Algorithm (Optimization Layer)",
      description: "ベクトル空間上の距離計算に基づき、アルゴリズムが「この二人は長期的な関係性を築ける可能性がある」という仮説（Hypothesis）を生成してマッチングを実行します。ここでは既知の相性だけでなく、未知の化学反応を期待する探索的な組み合わせも行われます。",
      icon: Network,
      color: "#0EA5E9"
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
      color: "#10B981"
    },
    {
      id: "04",
      title: "Dynamic Identity Update",
      subtitle: "動的更新",
      role: "Vector Database",
      description: "フィードバックや経験を通じて得られた変化を、ユーザー個人のベクトルデータに「差分（Delta）」として書き加えます。これにより、ZAXは「過去のあなた」ではなく、「変容し続ける現在のあなた」を常に学習し続けます。",
      icon: RefreshCw,
      color: "#F59E0B"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-[#1A1A1A] selection:bg-[#7C3AED] selection:text-white">
      <CorporateHeader />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 text-center md:text-left"
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-[#1A1A1A] text-white text-xs font-bold tracking-[0.2em]">
            SYSTEM ARCHITECTURE
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Learning Loop
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed font-medium text-gray-500 max-w-4xl">
            ZAXは、静的なマッチングを行うツールではなく、<br className="hidden md:block" />
            ユーザーの相互作用（Interaction）を通じて自律的に学習し、<br className="hidden md:block" />
            精度を高め続ける動的なエコシステムです。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[10%] bottom-[10%] left-1/2 w-px bg-gray-200 -translate-x-1/2" />

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
                className={`hidden md:flex absolute top-12 w-4 h-4 rounded-full border-4 border-white shadow-lg items-center justify-center z-10
                  ${i % 2 === 0 ? "right-[-8px] translate-x-1/2" : "left-[-8px] -translate-x-1/2"}`}
                style={{ backgroundColor: step.color }}
              />

              <div className="group relative p-8 md:p-12 rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
                <div className={`mb-8 flex items-center gap-4 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon size={32} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold tracking-widest text-gray-400 mb-1">{step.id}</div>
                    <div className="text-xs font-mono font-bold tracking-wider uppercase opacity-70" style={{ color: step.color }}>{step.role}</div>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">{step.title}</h3>
                <h4 className="text-lg font-bold text-gray-400 mb-6">{step.subtitle}</h4>
                
                <p className="text-base leading-loose text-gray-600 font-medium mb-6">
                  {step.description}
                </p>

                {step.details && (
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className={`text-sm ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-400 block mb-1">{detail.label}</span>
                        <span className="block text-gray-700 font-medium">{detail.value}</span>
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
