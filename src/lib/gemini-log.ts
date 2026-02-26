import { prisma } from "./db/client";

export type GeminiLogType =
  | "synthesis"
  | "matchReasoning"
  | "reflectionSummary"
  | "analyzeEssence"
  | "calculateDeltaVector"
  | "error";

/** Geminiの入出力をDBに保存（非同期・エラーは握りつぶす） */
export async function logGemini(
  type: GeminiLogType,
  prompt: string,
  response: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // 実行時に存在確認を行い、ビルドエラーを回避
    const p = prisma as any;
    if (!p?.geminiLog) return;
    
    await p.geminiLog.create({
      data: {
        type,
        prompt: prompt.slice(0, 50000),
        response: response.slice(0, 50000),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // ログ保存の失敗はメイン処理に影響させない
    console.warn("Gemini logging failed:", error);
  }
}
