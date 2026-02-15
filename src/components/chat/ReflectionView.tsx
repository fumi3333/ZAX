"use client";

import { motion } from "framer-motion";
import { Sparkles, Home } from "lucide-react";
import Link from "next/link";

interface ReflectionViewProps {
    answers: { aboutPartner: string; howChanged: string; grew: string; togetherFeel: string };
    summary: string;
    partnerName: string;
}

export default function ReflectionView({ answers, summary, partnerName }: ReflectionViewProps) {
    const items = [
        { q: "相手はどうでしたか？", a: answers.aboutPartner || "—" },
        { q: "自分はどう変わった？", a: answers.howChanged || "—" },
        { q: "成長を実感できた？", a: answers.grew || "—" },
        { q: "一緒にいてどうだった？", a: answers.togetherFeel || "—" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900">あなたの変化</h3>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl mb-6">
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">{summary}</p>
            </div>

            <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {partnerName}さんとの振り返り
                </p>
                {items.map((item) => (
                    <div key={item.q} className="text-sm">
                        <span className="text-slate-500">{item.q}</span>
                        <p className="text-slate-800 mt-0.5">{item.a}</p>
                    </div>
                ))}
            </div>

            <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
            >
                <Home className="w-4 h-4" />
                ホームへ
            </Link>
        </motion.div>
    );
}
