"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Zap } from "lucide-react";

interface BlindChatProps {
    onEndChat: () => void;
}

export default function BlindChat({ onEndChat }: BlindChatProps) {
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

        // Simulate reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "なるほど、その視点は面白いですね。僕も近い感覚があります。",
                sender: "them"
            }]);
            setResonance(prev => Math.min(100, prev + 15)); // Boost resonance on reply
        }, 1500);
    };

    return (
        <div className="w-full max-w-2xl h-[80vh] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 relative">
            {/* Header with Resonance Metter */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zax-accent to-blue-600 animate-pulse" />
                    <div>
                        <div className="text-xs text-zax-muted tracking-widest">CONNECTED TO</div>
                        <div className="text-sm font-bold text-white">#88X-29</div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-zax-glow text-sm font-mono mb-1">
                        <Zap size={14} fill="currentColor" />
                        RESONANCE: {Math.round(resonance)}%
                    </div>
                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-zax-glow shadow-[0_0_10px_#00F0FF]"
                            animate={{ width: `${resonance}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === "me"
                                ? "bg-zax-accent/20 border border-zax-accent/50 text-white rounded-br-none"
                                : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-none"
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {resonance > 80 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center my-4"
                    >
                        <span className="px-3 py-1 rounded-full bg-zax-glow/10 border border-zax-glow/30 text-zax-glow text-xs tracking-widest animate-pulse">
                            SYNERGY SPIKE DETECTED
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-zax-accent/50 transition-colors"
                />
                <button
                    onClick={handleSend}
                    className="p-3 bg-zax-accent rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                    <Send size={20} />
                </button>
            </div>

            <button
                onClick={onEndChat}
                className="absolute top-20 right-4 text-xs text-white/30 hover:text-white"
            >
                [End Simulation]
            </button>
        </div>
    );
}
