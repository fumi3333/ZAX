"use client";

import { useState } from "react";
import EssenceInput from "@/components/EssenceInput";
import EssenceVisualizer from "@/components/EssenceVisualizer";
import ResonanceResult from "@/components/ResonanceResult";
import BlindChat from "@/components/BlindChat";
import EvolutionFeedback from "@/components/EvolutionFeedback";
import LandingPage from "@/components/LandingPage";
import { AnalysisResult } from "@/lib/gemini";

export default function Home() {
  const [view, setView] = useState<"landing" | "input" | "analyzing" | "match" | "chat" | "feedback">("landing");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleEnter = () => {
    setView("input");
  };

  const handleInputComplete = async (inputData: { fragments: string[], biases: number[], purpose: string }) => {
    // ... (Keep existing logic)
    // console.log("Input data:", inputData);
    setView("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: inputData.fragments,
          biases: inputData.biases,
          purpose: inputData.purpose // Pass purpose
        }),
      });
      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      // 2. Find Match (Experiment)
      if (result.vector) {
        try {
          const matchResponse = await fetch("/api/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vector: result.vector }),
          });
          const matchData = await matchResponse.json();

          if (matchData.success && matchData.match) {
            // Update result with Scientific Match Data
            setAnalysisResult(prev => {
              if (!prev) return null;
              return {
                ...prev,
                reasoning: matchData.match.reasoning,
                resonance_score: matchData.match.growthScore
              };
            });
          }
        } catch (me) { console.error("Match API failed", me); }
      }

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
    setView("input"); // Loop back to Input, or "landing" if preferred
  };

  if (view === "landing") {
    return <LandingPage onEnter={handleEnter} />;
  }

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
