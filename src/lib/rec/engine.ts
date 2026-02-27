import { vectorStore } from "../db/client";
import { generateMatchReasoning } from "../gemini";



// ─── 6次元ラベル ───
export const DIMENSION_LABELS = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"];
export const DIMENSION_KEYS = ["Logic", "Intuition", "Empathy", "Determination", "Creativity", "Flexibility"];

// ─── Math Utilities ───
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

// 補完性スコア: 類似度0.5をピークとするベルカーブ
export function calculateComplementarityScore(userVec: number[], targetVec: number[]): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const optimalDistance = 0.5;
  const growthPotential = Math.exp(-Math.pow(sim - optimalDistance, 2) / 0.1);
  return growthPotential * 100;
}

// ─── Match Result Types ───
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

// ─── 日本語の推薦理由を生成 ───
function generateReasoning(userVec: number[], targetVec: number[], sim: number): string {
  let maxGapIndex = 0;
  let maxGap = -100;
  let minGapIndex = 0;
  let minGap = 100;

  userVec.forEach((val, i) => {
    const gap = targetVec[i] - val;
    if (gap > maxGap) { maxGap = gap; maxGapIndex = i; }
    if (gap < minGap) { minGap = gap; minGapIndex = i; }
  });

  const strongDim = DIMENSION_LABELS[maxGapIndex];
  const weakDim = DIMENSION_LABELS[minGapIndex];
  const simPercent = Math.round(sim * 100);
  const growthScore = Math.round(calculateComplementarityScore(userVec, targetVec));

  const templates = [
    `あなたの${weakDim}の高さが、相手の${strongDim}と補完関係にあります。共鳴度${simPercent}%は、成長を促す理想的な距離です。`,
    `${strongDim}が際立つ相手です。あなたにない視点を提供し、${weakDim}の強みで支え合える関係が期待できます。`,
    `ベクトル分析の結果、${strongDim}領域で+${Math.round(maxGap)}の差異を検出。互いの盲点を補い合う、成長ポテンシャル${growthScore}%の組み合わせです。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Top N マッチング検索 ───
export async function findTopMatches(
  userVector: number[],
  topN: number = 5,
  userSynthesis?: string
): Promise<MatchResult[]> {

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

        let reasoning = generateReasoning(userVector, candidateVector, sim);
        if (userSynthesis) {
          try {
            reasoning = await generateMatchReasoning(
              userSynthesis,
              "共鳴する魂",
              candidate.reasoning || "ベクトル空間上で共鳴する存在。",
              [],
              Math.round(sim * 100),
              Math.round(score)
            );
          } catch {
            /* fallback */
          }
        }
        results.push({
          matchUser: {
            id: candidate.userId,
            name: "共鳴する魂",
            vector: candidateVector,
            bio: candidate.reasoning || "ベクトル空間上で共鳴する存在。",
            tags: [],
          },
          similarity: sim,
          growthScore: Math.round(score),
          reasoning,
        });
      }

      if (results.length > 0) {
        return results
          .sort((a, b) => b.growthScore - a.growthScore)
          .slice(0, topN);
      }
    }
  } catch (e) {
    console.warn("DB Match failed", e);
  }

  // もしマッチ相手が1人もいなければ空配列を返す
  return [];
}

// 後方互換
export async function findBestMatch(userVector: number[]): Promise<MatchResult> {
  const matches = await findTopMatches(userVector, 1);
  return matches[0];
}
