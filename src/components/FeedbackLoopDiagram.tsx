"use client";

import { motion } from "framer-motion";
import { UserCheck, MessageSquare, RefreshCcw } from "lucide-react";

const NODES = [
  {
    icon: UserCheck,
    label: "マッチング",
    sub: "価値観ベクトルによる結合",
    // 上中央
    x: 50,
    y: 8,
  },
  {
    icon: MessageSquare,
    label: "対話・交流",
    sub: "ブラインドでの匿名対話",
    // 右下
    x: 85,
    y: 78,
  },
  {
    icon: RefreshCcw,
    label: "フィードバック",
    sub: "対話結果から学習",
    // 左下
    x: 15,
    y: 78,
    dark: true,
  },
];

// 三角形の辺: 上→右下→左下→上
const ARROWS = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 0 },
];

const NODE_R = 9; // ノード半径(%) — 矢印の始点/終点オフセット用

function getArrowPoints(
  fromX: number, fromY: number,
  toX: number, toY: number,
  r: number
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = fromX + ux * r;
  const sy = fromY + uy * r;
  const ex = toX - ux * r;
  const ey = toY - uy * r;
  return { sx, sy, ex, ey };
}

export default function FeedbackLoopDiagram() {
  return (
    <div className="w-full max-w-xs mx-auto select-none" style={{ aspectRatio: "1 / 1" }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
      >
        {/* 矢印マーカー */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="4"
            markerHeight="4"
            refX="3"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L4,2 L0,4 Z" fill="#cbd5e1" />
          </marker>
        </defs>

        {/* 辺（矢印） */}
        {ARROWS.map(({ from, to }, i) => {
          const f = NODES[from];
          const t = NODES[to];
          const { sx, sy, ex, ey } = getArrowPoints(f.x, f.y, t.x, t.y, NODE_R);
          return (
            <motion.line
              key={i}
              x1={`${sx}%`} y1={`${sy}%`}
              x2={`${ex}%`} y2={`${ey}%`}
              stroke="#e2e8f0"
              strokeWidth="0.8"
              markerEnd="url(#arrowhead)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}
            />
          );
        })}

        {/* ノード */}
        {NODES.map((node, i) => {
          const Icon = node.icon;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
              style={{ transformOrigin: `${node.x}% ${node.y}%` }}
            >
              {/* 白背景円 */}
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="9%"
                fill={node.dark ? "#0f172a" : "white"}
                stroke="#e2e8f0"
                strokeWidth="0.6"
              />

              {/* アイコン（foreignObject） */}
              <foreignObject
                x={`${node.x - 4}%`}
                y={`${node.y - 4}%`}
                width="8%"
                height="8%"
                style={{ overflow: "visible" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Icon
                    size={12}
                    color={node.dark ? "white" : "#475569"}
                    strokeWidth={1.8}
                  />
                </div>
              </foreignObject>

              {/* ラベル */}
              <text
                x={`${node.x}%`}
                y={`${node.y + 12}%`}
                textAnchor="middle"
                fontSize="3.2"
                fontWeight="700"
                fill="#0f172a"
                fontFamily="sans-serif"
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
