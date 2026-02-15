"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Activity, Sparkles, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EssenceInputData {
    fragments: string[];
    biases: number[];
    purpose: string;
}

interface EssenceInputProps {
    onComplete: (data: EssenceInputData) => void;
}

export default function EssenceInput({ onComplete }: EssenceInputProps) {
    const [step, setStep] = useState<"purpose" | "attributes" | "sns" | "fragments">("purpose");
    const [data, setData] = useState({
        purpose: "",
        attributes: [] as string[],
        sns: "",
        fragments: ["", "", ""],
    });

    const steps = ["purpose", "attributes", "sns", "fragments"];
    const currentStepIndex = steps.indexOf(step);
    const stepLabels = ["目的", "興味", "連携", "分析"];

    const purposes = [
        { id: "happiness", label: "HAPPINESS", title: "幸福の探求", desc: "人生単位の幸福と精神的充足を追求する", emoji: "✨", color: "#F59E0B" },
        { id: "romance", label: "ROMANCE", title: "魂の共鳴", desc: "魂が共鳴する深いパートナーシップを築く", emoji: "💫", color: "#EC4899" },
        { id: "friendship", label: "ALLIANCE", title: "生涯の盟友", desc: "相互に高め合う生涯の盟友を見つける", emoji: "🤝", color: "#7C3AED" },
    ];

    const tags = [
        "Startup", "Design", "Engineering", "Sauna", "Art", "Music", 
        "Cinema", "Philosophy", "Fashion", "Travel", "Crypto", "Cooking"
    ];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1] as typeof step);
        } else {
            onComplete({ 
                fragments: data.fragments, 
                biases: [50, 50, 50], 
                purpose: data.purpose 
            });
        }
    };

    const toggleTag = (tag: string) => {
        if (data.attributes.includes(tag)) {
            setData({ ...data, attributes: data.attributes.filter(t => t !== tag) });
        } else {
            setData({ ...data, attributes: [...data.attributes, tag] });
        }
    };

    return (
        <div 
            className="min-h-screen font-sans flex flex-col relative overflow-hidden"
            style={{ 
                backgroundColor: '#FAFAFA', 
                color: '#1A1A1A',
                backgroundImage: `radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 50%),
                                  radial-gradient(circle at 70% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)`,
            }}
        >
            {/* Progress Header */}
            <div 
                className="sticky top-0 z-50 px-6 py-5"
                style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight" style={{ color: '#1A1A1A' }}>ZAX</span>
                            <span className="text-sm ml-3 font-mono" style={{ color: '#888' }}>
                                STEP {currentStepIndex + 1} / {steps.length}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="hidden sm:flex items-center gap-3">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div 
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: i <= currentStepIndex ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.03)',
                                        color: i <= currentStepIndex ? '#7C3AED' : '#888',
                                        border: i === currentStepIndex ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                                    }}
                                >
                                    {i < currentStepIndex ? <Check className="w-3 h-3" /> : null}
                                    {stepLabels[i]}
                                </div>
                                {i < steps.length - 1 && (
                                    <div 
                                        className="w-8 h-px"
                                        style={{ backgroundColor: i < currentStepIndex ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.08)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
                <div className="w-full max-w-4xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: PURPOSE */}
                        {step === "purpose" && (
                            <motion.div
                                key="purpose"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 01</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span style={{ color: '#1A1A1A' }}>あなたの</span>
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >目的</span>
                                    <span style={{ color: '#1A1A1A' }}>は？</span>
                                </h2>
                                <p className="mb-16 text-lg" style={{ color: '#666' }}>
                                    ZAXを利用する主な目的を教えてください。
                                </p>
                                
                                {/* Purpose Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {purposes.map((p, i) => (
                                        <motion.button
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setData({ ...data, purpose: p.id });
                                                handleNext();
                                            }}
                                            className="group relative p-8 rounded-3xl transition-all duration-500 text-center"
                                            style={{
                                                backgroundColor: 'white',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <div className="text-5xl mb-6">{p.emoji}</div>
                                            <div 
                                                className="text-xs font-mono tracking-widest mb-2"
                                                style={{ color: p.color }}
                                            >
                                                {p.label}
                                            </div>
                                            <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>{p.title}</h3>
                                            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{p.desc}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: ATTRIBUTES */}
                        {step === "attributes" && (
                            <motion.div
                                key="attributes"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#0EA5E9' }}>STEP 02</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >興味・関心</span>
                                    <span style={{ color: '#1A1A1A' }}>を選択</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    興味のある分野を選択してください（複数可）
                                </p>
                                
                                <div className="flex flex-wrap gap-3 justify-center mb-12 max-w-2xl mx-auto">
                                    {tags.map((tag, i) => (
                                        <motion.button
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => toggleTag(tag)}
                                            className="px-5 py-3 rounded-full text-sm font-medium transition-all duration-300"
                                            style={{
                                                backgroundColor: data.attributes.includes(tag) ? '#7C3AED' : 'white',
                                                color: data.attributes.includes(tag) ? 'white' : '#666',
                                                border: data.attributes.includes(tag) ? '1px solid #7C3AED' : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: data.attributes.includes(tag) ? '0 4px 15px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            {data.attributes.includes(tag) && <Check className="w-4 h-4 inline mr-1.5" />}
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={data.attributes.length === 0}
                                    className="px-10 py-4 rounded-full font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                    }}
                                >
                                    次のステップへ
                                    <ArrowRight className="w-5 h-5 inline ml-2" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* STEP 3: SNS */}
                        {step === "sns" && (
                            <motion.div
                                key="sns"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#10B981' }}>STEP 03</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >シグナル</span>
                                    <span style={{ color: '#1A1A1A' }}>を同期</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    SNSデータを連携して、思考ベクトルを抽出します
                                </p>
                                
                                <div className="max-w-md mx-auto space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}
                                        className="w-full p-6 rounded-2xl flex items-center gap-5 transition-all group"
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <div 
                                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: '#000' }}
                                        >
                                            <X className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-lg" style={{ color: '#1A1A1A' }}>X (Twitter)</div>
                                            <div className="text-sm" style={{ color: '#888' }}>テキストベクトルを解析</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5" style={{ color: '#ccc' }} />
                                    </motion.button>
                                    
                                    <button 
                                        onClick={handleNext}
                                        className="w-full py-4 font-medium transition-colors"
                                        style={{ color: '#888' }}
                                    >
                                        スキップして手動入力 →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: FRAGMENTS */}
                        {step === "fragments" && (
                            <motion.div
                                key="fragments"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 04</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >分析開始</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    入力データから本質ベクトルを生成します
                                </p>
                                
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md mx-auto p-10 rounded-3xl"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div 
                                        className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                                        }}
                                    >
                                        <Activity className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3" style={{ color: '#1A1A1A' }}>ベクトル化準備完了</h3>
                                    <p className="text-sm leading-relaxed mb-10" style={{ color: '#888' }}>
                                        入力されたデータから、あなたの「本質ベクトル」を生成します。<br/>
                                        生成には10-20秒かかる場合があります。
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(124, 58, 237, 0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onComplete({
                                            fragments: ["シミュレート入力"],
                                            biases: [50, 50, 50],
                                            purpose: data.purpose
                                        })}
                                        className="w-full py-5 rounded-full font-bold text-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                        }}
                                    >
                                        エッセンスベクトルを生成
                                        <Zap className="w-5 h-5 inline ml-2" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
