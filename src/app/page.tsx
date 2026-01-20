"use client";

import { useState } from "react";
import EssenceInput from "@/components/EssenceInput";
import EssenceVisualizer from "@/components/EssenceVisualizer";
import ResonanceResult from "@/components/ResonanceResult";
import BlindChat from "@/components/BlindChat";
import EvolutionFeedback from "@/components/EvolutionFeedback";

export default function Home() {
  const [view, setView] = useState<"input" | "analyzing" | "match" | "chat" | "feedback">("input");

  const handleInputComplete = (data: string[]) => {
    console.log("Input data:", data);
    setView("analyzing");
    // Simulate analysis delay
    setTimeout(() => {
      setView("match"); // Proceed to match after analysis
    }, 4000);
  };

  const handleStartChat = () => {
    setView("chat");
  };

  const handleEndChat = () => {
    setView("feedback");
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-zax-accent/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zax-glow/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {view === "input" && <EssenceInput onComplete={handleInputComplete} />}

      {view === "analyzing" && <EssenceVisualizer />}

      {view === "match" && <ResonanceResult onStartChat={handleStartChat} />}

      {view === "chat" && <BlindChat onEndChat={handleEndChat} />}

      {view === "feedback" && <EvolutionFeedback />}
    </main>
  );
}
