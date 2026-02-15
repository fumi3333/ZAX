"use client";

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
  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, data[0]?.fullMark ?? 100]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
