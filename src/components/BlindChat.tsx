"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Zap, Coffee } from "lucide-react";

interface BlindChatProps {
    partnerName?: string;
    onEndChat: () => void;
}

export default function BlindChat({ partnerName, onEndChat }: BlindChatProps) {
    const [messages, setMessages] = useState<{ id: number; text: string; sender: "me" | "them" }[]>([
        { id: 1, text: "はじめまして。", sender: "them" },
    ]);
    const [inputText, setInputText] = useState("");
    const [resonance, setResonance] = useState(50);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Simulate resonance fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setResonance(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.4) * 5)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), text: inputText, sender: "me" as const };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        // Simulate reply with random responses to feel "alive"
        setTimeout(() => {
            const responses = [
                "なるほど、その視点は面白いですね。",
                "確かに。でも、逆にこういう見方もできませんか？",
                "すごく共感します。僕も同じことを考えていました。",
                "それは深いですね...もう少し詳しく教えてもらえますか？",
                "ふむ、あなたの価値観が少し見えてきた気がします。",
                "意外です。そういう一面もお持ちなんですね。",
                "そう言われると、確かにそうかもしれません。",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: randomResponse,
                sender: "them"
            }]);
            setResonance(prev => Math.min(100, prev + 15)); // Boost resonance on reply
        }, 1500);
    };

    return (
        <div className="w-full h-[80vh] flex flex-col bg-white/70 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/40 relative shadow-xl shadow-slate-200/50">
            {/* Header with Resonance Metter */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center relative">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-blue-200 opacity-50" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 tracking-widest uppercase mb-0.5 font-bold">相手</div>
                        <div className="text-base font-bold text-slate-800 tracking-tight">{partnerName || '共鳴する相手'}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-mono mb-1 tracking-wider font-bold">
                            <Zap size={12} fill="currentColor" />
                            共鳴度: {Math.round(resonance)}%
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                animate={{ width: `${resonance}%` }}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={onEndChat}
                        className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border-l border-slate-200 pl-6 py-1 font-bold"
                    >
                        終了
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-50/50" ref={scrollRef}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "me"
                                ? "bg-white border border-blue-100 text-slate-700 rounded-br-none shadow-blue-100/50"
                                : "bg-white border border-slate-100 text-slate-600 rounded-bl-none"
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {resonance > 80 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 my-4"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold tracking-wider shadow-sm">
                            共鳴度高
                        </span>
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors">
                            <Coffee className="w-4 h-4" />
                            会う約束をする
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Floating Input Area (The "Floor") */}
            <div className="p-8 bg-gradient-to-t from-white via-white/80 to-transparent z-20">
                <div className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-full px-2 py-2 shadow-2xl shadow-slate-200/50 ring-4 ring-slate-50 group focus-within:ring-blue-50 transition-all">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-transparent border-none px-6 text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium tracking-wide"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 1)" }} // Blue-600
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className="p-3 bg-slate-900 rounded-full text-white shadow-lg shadow-slate-200 transition-all"
                    >
                        <Send size={18} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
