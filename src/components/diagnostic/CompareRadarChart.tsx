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
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="あなた"
            dataKey="me"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="相手"
            dataKey="partner"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
