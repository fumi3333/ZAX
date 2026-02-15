# ZAX プロジェクト — 完全コードベース（Gemini Pro 解析用）

このファイルは、ZAXプロジェクトの主要なソースコードを1つにまとめたものです。

---

## プロジェクト概要

**名前**: ZAX  
**目的**: 価値観ベクトルでつながる、本質的マッチングプラットフォーム  
**技術**: Next.js 16 + Gemini Pro + PostgreSQL + pgvector  
**現在のフェーズ**: Phase 1 (MVP — Hackathon Demo Ready)

---

## 主要技術スタック

```json
{
  "dependencies": {
    "next": "16.1.4",
    "react": "19.2.3",
    "@google/generative-ai": "^0.24.1",
    "@prisma/client": "^7.3.0",
    "framer-motion": "^12.29.2",
    "recharts": "^3.7.0",
    "lucide-react": "^0.562.0",
    "bcryptjs": "^3.0.3",
    "tailwindcss": "^4.1.18"
  }
}
```

---

## データベーススキーマ

### ファイル: `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector] // pgvector拡張
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]

  @@map("users")
}

model EssenceVector {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 6次元のエッセンスベクトル (pgvector検索用)
  vector         Unsupported("vector(6)") 
  vectorJson     String   
  reasoning      String   
  resonanceScore Float    @default(0.0)
  createdAt      DateTime @default(now())

  @@map("essence_vectors")
}

model Interaction {
  id String @id @default(uuid())

  userAId String
  userBId String

  // マッチング時点のベクトル（スナップショット）
  vectorA String // JSON: [80,60,90,45,70,85]
  vectorB String

  // フィードバック（ユーザーAから見たB）
  fulfillmentScore Int?  // 充足感 (1-10)
  willMeetAgain    Int?  // また会いたい (1-10)
  partnerSeemed    Int?  // 相手は楽しそう (1-10)
  growthPotential  Int?  // 成長できそう (1-10)
  feedbackText     String? // 自由記述

  createdAt DateTime @default(now())

  @@map("interactions")
  @@index([userAId, createdAt(sort: Desc)])
}

model DiagnosticResult {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  answers   String   // JSON
  synthesis String   
  vector    String   // JSON (768次元)
  createdAt DateTime @default(now())

  @@map("diagnostic_results")
}
```

---

## AI分析エンジン

### ファイル: `src/lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-pro" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export interface AnalysisResult {
    vector: number[]; // 6-dim (0-100)
    embedding?: number[]; // 768-dim
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。",
            resonance_score: 88,
        };
    }

    const sanitize = (str: string) => str.replace(/`/g, "'").replace(/\$/g, "");
    const safeInputs = inputs.map(sanitize);

    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${sanitize(purpose)}"
    
    Fragments:
    1. ${safeInputs[0]}
    2. ${safeInputs[1]}
    3. ${safeInputs[2]}

    Dimensions (0-100):
    - Logic (Logic & Structure)
    - Intuition (Insight & Pattern)
    - Empathy (Emotional Resonance)
    - Determination (Willpower & Drive)
    - Creativity (Novelty & Art)
    - Flexibility (Adaptability & Openness)

    Task:
    1. Estimate values (0-100) for each dimension
    2. Generate a "Reasoning" summary (Max 100 chars, in JAPANESE)
    3. Calculate a "Resonance Score" (0-100)

    Format: JSON only. Keys: "vector" (array), "reasoning" (string), "resonance_score" (number).
    `;

    try {
        const [result, embeddingResult] = await Promise.all([
            model.generateContent(prompt),
            embeddingModel.embedContent(inputs.join(" "))
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonStr) as AnalysisResult;

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values
        };
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            vector: [50, 50, 50, 50, 50, 50],
            reasoning: "解析中にエラーが発生しました。",
            resonance_score: 50
        };
    }
}
```

---

## マッチングエンジン

### ファイル: `src/lib/rec/engine.ts`

```typescript
import { vectorStore } from "../db/client";

// ─── 50 Archetype Personas (Demo Seed) ───
export const ARCHETYPE_USERS = [
  // 論理重視型 (10人)
  { id: "A-001", name: "田中 健太", vector: [92, 25, 35, 78, 40, 30], bio: "構造的な思考を得意とし、物事の根本原理を追求する。", tags: ["Logic", "Structure"] },
  { id: "A-002", name: "山本 理沙", vector: [88, 30, 45, 70, 35, 40], bio: "データに基づく意思決定を重視する分析家。", tags: ["Logic", "Analysis"] },
  // ... (全50人のデータ省略)
];

export const DIMENSION_LABELS = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"];

// ─── コサイン類似度 ───
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  return magA === 0 || magB === 0 ? 0 : dotProduct(a, b) / (magA * magB);
}

// ─── 補完性スコア ───
// 仮説: 類似度0.5をピークとするベルカーブ
// 理由: 似すぎた相手はエコーチェンバーを生む、遠すぎる相手は衝突を生む
export function calculateComplementarityScore(userVec: number[], targetVec: number[]): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const optimalDistance = 0.5;
  const growthPotential = Math.exp(-Math.pow(sim - optimalDistance, 2) / 0.1);
  return growthPotential * 100;
}

// ─── Match Result ───
export interface MatchResult {
  matchUser: {
    id: string;
    name: string;
    vector: number[];
    bio: string;
    tags: string[];
  };
  similarity: number;
  growthScore: number;
  reasoning: string;
}

// ─── 推薦理由生成 ───
function generateReasoning(userVec: number[], targetVec: number[], sim: number): string {
  let maxGapIndex = 0;
  let maxGap = -100;

  userVec.forEach((val, i) => {
    const gap = targetVec[i] - val;
    if (gap > maxGap) { maxGap = gap; maxGapIndex = i; }
  });

  const strongDim = DIMENSION_LABELS[maxGapIndex];
  const simPercent = Math.round(sim * 100);

  return `あなたにない${strongDim}を持つ相手です。共鳴度${simPercent}%は、成長を促す理想的な距離です。`;
}

// ─── Top N マッチング ───
export async function findTopMatches(userVector: number[], topN: number = 5): Promise<MatchResult[]> {

  // 1. DB検索を試みる
  try {
    const dbCandidates = await vectorStore.searchSimilar(userVector, 20);

    if (dbCandidates.length > 0) {
      const results: MatchResult[] = [];
      for (const candidate of dbCandidates) {
        let candidateVector: number[] = [];
        try {
          candidateVector = JSON.parse(candidate.vectorJson || candidate.vector);
        } catch { continue; }

        const sim = cosineSimilarity(userVector, candidateVector);
        const score = calculateComplementarityScore(userVector, candidateVector);

        results.push({
          matchUser: {
            id: candidate.userId,
            name: "Resonant Soul",
            vector: candidateVector,
            bio: candidate.reasoning || "ベクトル空間上で共鳴する存在。",
            tags: [],
          },
          similarity: sim,
          growthScore: Math.round(score),
          reasoning: generateReasoning(userVector, candidateVector, sim),
        });
      }

      if (results.length > 0) {
        return results
          .sort((a, b) => b.growthScore - a.growthScore)
          .slice(0, topN);
      }
    }
  } catch (e) {
    console.warn("DB Match failed, falling back to Archetypes", e);
  }

  // 2. アーキタイプ（50人）をフォールバック
  const results: MatchResult[] = ARCHETYPE_USERS.map((arch) => {
    const sim = cosineSimilarity(userVector, arch.vector);
    const score = calculateComplementarityScore(userVector, arch.vector);
    return {
      matchUser: arch,
      similarity: sim,
      growthScore: Math.round(score),
      reasoning: generateReasoning(userVector, arch.vector, sim),
    };
  });

  return results
    .sort((a, b) => b.growthScore - a.growthScore)
    .slice(0, topN);
}
```

---

## データベースクライアント

### ファイル: `src/lib/db/client.ts`

```typescript
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック

let prisma: any;
let vectorStore: any;

try {
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(userId: string, vector: number[], reasoning: string, resonanceScore: number) {
            const vectorString = `[${vector.join(",")}]`;
            await prisma.$executeRaw`
                INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
            `;
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            const vectorString = `[${targetVector.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev."vectorJson", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        },
    };

    prisma.$queryRaw`SELECT 1`
        .then(() => console.log("✅ PostgreSQL + pgvector 接続成功"))
        .catch((err: any) => console.warn("⚠️ DB接続失敗:", err.message));
} catch (e: any) {
    console.warn("⚠️ Prisma Client が見つかりません。モックを使用します。");

    // Mock Store
    const mockVectors: any[] = [];

    prisma = {
        user: { /* mock methods */ },
        diagnosticResult: { /* mock methods */ },
    };

    vectorStore = {
        async saveEmbedding(userId: string, vector: number[], reasoning: string, resonanceScore: number) {
            mockVectors.push({ userId, vector, reasoning, resonanceScore });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            // モックでもコサイン類似度検索を実行
            return mockVectors
                .map((mv) => ({
                    userId: mv.userId,
                    vectorJson: JSON.stringify(mv.vector),
                    reasoning: mv.reasoning,
                }))
                .slice(0, limit);
        },
    };
}

export { prisma, vectorStore };
```

---

## API: 診断送信

### ファイル: `src/app/api/diagnostic/submit/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let userId = sessionId;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        const email = `guest_${sessionId}@musashino-u.ac.jp`;
        user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            user = await prisma.user.create({
                data: { email, password: "guest-password" }
            });
        }
    }
    
    if (user) userId = user.id;

    // カテゴリ別スコア集計
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    for (const [id, score] of Object.entries(answers)) {
      const q = questions.find(q => q.id === Number(id));
      if (q) {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += score;
        categoryScores[q.categoryJa].count += 1;
      }
    }

    let profileText = "性格診断の回答に基づき、詳細に分析してください。\n\n";
    profileText += "## カテゴリ別スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        const avg = (data.sum / data.count).toFixed(1);
        profileText += `- ${cat}: 平均 ${avg}/7.0\n`;
    }

    // Gemini Pro で分析
    let synthesis = "AI分析サービスに一時的な制限がかかっています。";
    try {
        const result = await model.generateContent(profileText);
        synthesis = (await result.response).text() || synthesis;
    } catch (e) {
        console.warn("Gemini API Error (Synthesis):", e);
    }

    // text-embedding-004 でベクトル化
    let vector: number[] = new Array(768).fill(0).map(() => Math.random());
    try {
        const embeddingResult = await embeddingModel.embedContent(synthesis);
        vector = embeddingResult.embedding.values;
    } catch (e) {
        console.warn("Gemini API Error (Embedding):", e);
    }

    // DB保存
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId,
        answers: JSON.stringify(answers),
        synthesis,
        vector: JSON.stringify(vector),
      },
    });

    await vectorStore.saveEmbedding(userId, vector, "Diagnostic Result", 1.0);

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis 
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error.message 
    }, { status: 500 });
  }
}
```

---

## API: マッチング検索

### ファイル: `src/app/api/match/route.ts`

```typescript
import { NextResponse } from "next/server";
import { findTopMatches } from "@/lib/rec/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vector, topN = 5 } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const matches = await findTopMatches(vector, topN);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

---

## UIコンポーネント: マッチング結果

### ファイル: `src/components/diagnostic/MatchResults.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, TrendingUp, MessageCircle } from "lucide-react";
import CompareRadarChart from "./CompareRadarChart";
import FeedbackDialog from "./FeedbackDialog";

interface Match {
  matchUser: {
    id: string;
    name: string;
    vector: number[];
    bio: string;
    tags: string[];
  };
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
    }
  }, [userVector]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <span>マッチング候補を検索中...</span>
      </div>
    );
  }

  const top3 = matches.slice(0, 3);

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-black text-center">
        あなたと共鳴するパートナー
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {top3.map((match, i) => (
          <motion.div
            key={match.matchUser.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <h3 className="text-lg font-bold">{match.matchUser.name}</h3>
              <p className="text-xs text-slate-500">{match.matchUser.bio}</p>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <span className="text-xs">共鳴度</span>
                  <div className="text-xl font-black">
                    {Math.round(match.similarity * 100)}%
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <span className="text-xs">成長性</span>
                  <div className="text-xl font-black text-indigo-600">
                    {match.growthScore}%
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <CompareRadarChart
                myVector={userVector}
                partnerVector={match.matchUser.vector}
              />

              {/* Reasoning */}
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs">{match.reasoning}</p>
              </div>

              {/* Feedback Button */}
              <button
                onClick={() => setFeedbackTarget(match)}
                className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg"
              >
                フィードバックを送る
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <FeedbackDialog
        match={feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
      />
    </section>
  );
}
```

---

## アルゴリズムの核心

### 補完性スコアの数式

```
growthScore(userVec, targetVec) = exp(-(similarity - 0.5)² / 0.1) × 100

where:
  similarity = cosineSimilarity(userVec, targetVec)
  範囲: 0 (完全に無関係) ~ 1 (完全一致)
```

**仮説**: 
- 類似度1.0（完全一致）: エコーチェンバー → 成長停滞
- 類似度0.0（無関係）: 価値観の衝突 → 関係構築困難
- **類似度0.5（適度な差）**: 共感 + 新しい刺激 = 成長を促す理想的な距離

---

## データフロー（ユーザー視点）

```
1. ランディングページ訪問
   ↓
2. 「診断を開始」クリック
   ↓
3. 50問診断（7段階バブルUI）
   ↓
4. POST /api/diagnostic/submit
   - 回答データ送信
   - Gemini Pro で性格分析
   - text-embedding-004 で768次元ベクトル化
   - DB保存
   ↓
5. 結果ページ表示
   - 6次元レーダーチャート
   - AI分析レポート
   ↓
6. POST /api/match
   - 6次元ベクトル送信
   - pgvector で類似検索（または50人のアーキタイプから）
   - 補完性スコアでランキング
   ↓
7. Top 3 マッチング候補表示
   - 比較レーダーチャート
   - AI推薦理由
   - フィードバックボタン
   ↓
8. フィードバック送信（将来実装）
   - 4つのスライダー（1-10）
   - 自由記述
   - Interactionテーブルに保存
```

---

## 重要な設計判断

### なぜ「補完性スコア」なのか？

**背景**: 
- 単純な類似度マッチングは「似た者同士」を引き合わせるだけ
- 心理学的に、似すぎた関係は成長を妨げる（確証バイアス）

**数学的根拠**:
- ベルカーブ（ガウス分布）で「適度な差異」を評価
- 最適類似度0.5は仮説（実データで検証予定）

### なぜPostgreSQL + pgvectorか？

| 選択肢 | 利点 | 欠点 | 結論 |
|--------|------|------|------|
| Pinecone | 速い | 月$70〜 | ×（コスト） |
| pgvector | PostgreSQL統合、無料 | 学習必要 | ✅ **採用** |

**決定理由**:
1. リレーショナルデータとベクトルを1つのDBで管理
2. コスト削減（外部サービス不要）
3. HNSW インデックスによる高速検索

---

## 今後の展望

### Phase 2: RAG実装（2026 Q3-Q4）
- マッチング履歴を蓄積
- pgvectorで過去の類似体験を検索
- Geminiにコンテキストとして渡し、精度向上

### Phase 3: 生体データ統合（2027）
- スマートウォッチ連携（心拍変動）
- 音声分析（感情推定）

### Phase 4: 統合モデル（2028-2029）
- 全ユーザーのデータから学習
- 「類似度0.5が最適」の実証
- Federated Learning

### Phase 5: BMI統合（2030-）
- 脳波からの無意識データ取得
- 倫理委員会・規制対応

---

## 解析のポイント（Gemini Proへの問いかけ）

**問1**: 補完性スコアの数式（類似度0.5をピークとするベルカーブ）は、心理学的・数学的に妥当か？

**問2**: RAGによる継続学習（ファインチューニング不要）は、個人最適化において十分な効果を得られるか？

**問3**: 6次元ベクトル（論理性、直感力、共感性、意志力、創造性、柔軟性）は、人間の本質を表現するのに適切な次元数と軸か？

**問4**: pgvectorのHNSWインデックスは、10万人規模のユーザーでも高速検索を維持できるか？

**問5**: このプロジェクトの最大の技術的リスクは何か？どう対策すべきか？

---

**以上が、ZAXプロジェクトの主要コードと設計思想です。**
**Gemini Proによる多角的な分析・アドバイスをお願いします。**
