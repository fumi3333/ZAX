"use client";

import { useState } from "react";
import EssenceInput from "@/components/EssenceInput";
import EssenceVisualizer from "@/components/EssenceVisualizer";
import ResonanceResult from "@/components/ResonanceResult";
import BlindChat from "@/components/BlindChat";
import EvolutionFeedback from "@/components/EvolutionFeedback";
import { AnalysisResult } from "@/lib/gemini";

export default function Home() {
  const [view, setView] = useState<"input" | "analyzing" | "match" | "chat" | "feedback">("input");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleInputComplete = async (data: string[]) => {
    console.log("Input data:", data);
    setView("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: data }),
      });
      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      // Allow user to see the crystallized vector for a moment
      setTimeout(() => {
        setView("match");
      }, 3000);
    } catch (e) {
      console.error("Analysis failed", e);
      // Fallback or error handling
      setTimeout(() => {
        setView("match");
      }, 3000);
    }
  };

  const handleStartChat = () => {
    setView("chat");
  };

  const handleEndChat = () => {
    setView("feedback");
  };

  const handleRestart = () => {
    setAnalysisResult(null);
    setView("input");
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-zax-accent/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zax-glow/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {view === "input" && <EssenceInput onComplete={handleInputComplete} />}

      {view === "analyzing" && <EssenceVisualizer vector={analysisResult?.vector} />}

      {view === "match" && (
        <ResonanceResult
          onStartChat={handleStartChat}
          reasoning={analysisResult?.reasoning}
          score={analysisResult?.resonance_score}
        />
      )}

      {view === "chat" && <BlindChat onEndChat={handleEndChat} />}

      {view === "feedback" && <EvolutionFeedback onRestart={handleRestart} />}
    </main>
  );
}
