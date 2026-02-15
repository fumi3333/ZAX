"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, TrendingUp, MessageCircle } from "lucide-react";
import CompareRadarChart from "./CompareRadarChart";
import FeedbackDialog from "./FeedbackDialog";

interface MatchUser {
  id: string;
  name: string;
  vector: number[];
  bio: string;
  tags: string[];
}

interface Match {
  matchUser: MatchUser;
  similarity: number;
  growthScore: number;
  reasoning: string;
}

interface MatchResultsProps {
  userVector: number[];
}

export default function MatchResults({ userVector }: MatchResultsProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState<Match | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vector: userVector, topN: 5 }),
        });
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userVector.length === 6) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [userVector]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">マッチング候補を検索中...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  const top3 = matches.slice(0, 3);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-sm">
          <Users className="w-4 h-4" />
          RESONANCE MATCH
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
          あなたと<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">共鳴する</span>パートナー
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          補完性スコアの高い相手は、似すぎず違いすぎない「成長を促す関係」を築けます。
        </p>
      </motion.div>

      {/* Match Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {top3.map((match, i) => (
          <motion.div
            key={match.matchUser.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="relative h-full bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                {i + 1}
              </div>

              <div className="p-6 space-y-4">
                {/* Name & Bio */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {match.matchUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {match.matchUser.bio}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                  {match.matchUser.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">共鳴度</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">
                      {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">成長性</span>
                    </div>
                    <span className="text-xl font-black text-indigo-600">
                      {match.growthScore}%
                    </span>
                  </div>
                </div>

                {/* Radar Chart */}
                <CompareRadarChart
                  myVector={userVector}
                  partnerVector={match.matchUser.vector}
                />

                {/* AI Reasoning */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {match.reasoning}
                  </p>
                </div>

                {/* Feedback Button */}
                <button
                  onClick={() => setFeedbackTarget(match)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  フィードバックを送る
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        match={feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
      />
    </section>
  );
}
