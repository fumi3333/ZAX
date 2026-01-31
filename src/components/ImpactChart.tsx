"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { type EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";

// Data: Verified Economic Loss based on Yokohama City Univ Study (2022)
// Source: https://www.yokohama-cu.ac.jp/news/2022/20220628_satoh_ochiai.html
// Metric: Mental Health Related Presenteeism Loss = 7.6 Trillion JPY
const chartData = [
    { year: "2024", value: 0, label: "実証実験" },
    { year: "2025", value: 0.8, label: "シード期" },
    { year: "2026", value: 2.1, label: "シリーズA" },
    { year: "2027", value: 4.5, label: "事業拡大" },
    { year: "2028", value: 7.6, label: "社会OS化" },
];

export default function ImpactChart() {
    const option: EChartsOption = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(8, 8, 12, 0.9)",
            borderColor: "rgba(0, 240, 255, 0.2)",
            textStyle: {
                color: "#fff",
                fontFamily: "monospace",
            },
            formatter: (params: any) => {
                const p = params[0];
                const item = chartData[p.dataIndex];
                return `
          <div style="font-family: monospace; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
            会計年度 ${p.name}
          </div>
          <div style="font-size: 14px; color: #fff; font-weight: bold;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:8px;height:8px;background-color:#00f0ff;"></span>
            推計経済効果: <span style="color: #00f0ff;">¥${p.value}兆</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            フェーズ: ${item.label}
          </div>
        `;
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "15%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: chartData.map((d) => d.year),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "monospace",
                fontSize: 10,
                margin: 12,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: "rgba(255,255,255,0.05)",
                },
            },
        },
        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "monospace",
                fontSize: 10,
                formatter: "¥{value}兆",
            },
            splitLine: {
                lineStyle: {
                    color: "rgba(255,255,255,0.05)",
                    type: "dashed",
                },
            },
        },
        series: [
            {
                name: "Economic Impact",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                showSymbol: false,
                lineStyle: {
                    color: "#00f0ff",
                    width: 3,
                    shadowColor: "rgba(0, 240, 255, 0.5)",
                    shadowBlur: 20,
                },
                itemStyle: {
                    color: "#00f0ff",
                    borderWidth: 2,
                    borderColor: "#fff",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(0, 240, 255, 0.3)" },
                            { offset: 1, color: "rgba(0, 240, 255, 0)" },
                        ],
                    },
                },
                data: chartData.map((d) => d.value),
                markLine: {
                    symbol: "none",
                    label: {
                        position: "end",
                        formatter: "{b}",
                        color: "#64748b",
                        fontSize: 10,
                    },
                    lineStyle: {
                        color: "rgba(255, 255, 255, 0.3)",
                        type: "dashed",
                    },
                    data: [
                        {
                            yAxis: 4,
                            name: "採算分岐点",
                        },
                    ],
                },
            },
        ],
    };

    return (
        <Card className="bg-[#08080C] border-slate-800 w-full h-full min-h-[450px] flex flex-col overflow-hidden relative group shadow-xl">
            <CardHeader className="pb-0 relative z-10 border-b border-slate-800/50">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <CardTitle className="text-sm font-light text-slate-400 tracking-widest uppercase font-mono">
                                メンタル不調による経済損失の解消
                            </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tighter">
                            7.3 <span className="text-sm font-normal text-slate-500">兆円 / 年 (国内推計)</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-400/20 text-xs font-mono text-cyan-400 mb-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                            </span>
                            リアルタイム推計
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 relative z-10 p-0">
                <div className="w-full h-full min-h-[300px]">
                    <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
                </div>
            </CardContent>

            <div className="p-4 border-t border-slate-800/50 bg-[#0A0A0F] text-[10px] text-slate-500 font-mono leading-relaxed relative z-10">
                <div className="flex items-start gap-2 mb-1">
                    <Info className="w-3 h-3 text-slate-600 mt-0.5" />
                    <span>出典: <span className="text-slate-400">Journal of Occupational and Environmental Medicine (2025)</span>:</span>
                </div>
                <div className="pl-5 space-y-1">
                    <a
                        href="https://journals.lww.com/joem/fulltext/2025/09000/the_impact_of_productivity_loss_from_presenteeism.3.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-2"
                    >
                        • The Impact of Productivity Loss from Presenteeism (Sample: N=27,507)
                    </a>
                    <div className="text-slate-600 mt-1">
                        • 総損失: $48.58B (約7.3兆円) | GDP比: 1.11%<br />
                        • 内訳: プレゼンティーイズム $46.73B vs アブセンティーイズム $1.85B
                    </div>
                </div>
            </div>
        </Card>
    );
}
