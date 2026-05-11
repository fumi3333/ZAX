"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";

interface ResultRadarChartProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function ResultRadarChart({ data }: ResultRadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // クライアントサイドでのマウント前はスケルトンを表示してHydration Errorを防ぐ
    return (
      <div className="w-full h-[260px] sm:h-[340px] flex items-center justify-center bg-slate-50/50 rounded-2xl animate-pulse">
        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Chart Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[260px] sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, data[0]?.fullMark ?? 100]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#0f172a"
            fill="#475569"
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
