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
    const p = prisma as { geminiLog?: { create: (args: any) => Promise<any> } };
    if (!p?.geminiLog) return;
    await p.geminiLog.create({
      data: {
        type,
        prompt: prompt.slice(0, 50000),
        response: response.slice(0, 50000),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // ログ失敗は本処理に影響させない
  }
}
