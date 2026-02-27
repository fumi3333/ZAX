"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompareRadarChartProps {
  myVector: number[];
  partnerVector: number[];
  labels?: string[];
}

export default function CompareRadarChart({
  myVector,
  partnerVector,
  labels = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"],
}: CompareRadarChartProps) {
  const data = labels.map((label, i) => ({
    subject: label,
    me: myVector[i] ?? 0,
    partner: partnerVector[i] ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#0f172a", fontSize: 10, fontWeight: 800 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="あなた"
            dataKey="me"
            stroke="#000000"
            fill="#000000"
            fillOpacity={0.3}
            strokeWidth={3}
          />
          <Radar
            name="相手"
            dataKey="partner"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
