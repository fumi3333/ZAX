# Geminiログ - gemini-log.ts
パス: `src/lib/gemini-log.ts`

## 役割
- Geminiのリクエスト/レスポンスをDBのgeminiLogテーブルに記録（デバッグ用）

## コード
```typescript
import { prisma } from "./db/client";

export type GeminiLogType =
  | "synthesis"
  | "matchReasoning"
  | "reflectionSummary"
  | "analyzeEssence"
  | "calculateDeltaVector"
  | "error";

/** Gemini縺ｮ蜈･蜃ｺ蜉帙ｒDB縺ｫ菫晏ｭ假ｼ磯撼蜷梧悄繝ｻ繧ｨ繝ｩ繝ｼ縺ｯ謠｡繧翫▽縺ｶ縺呻ｼ・*/
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
    // 繝ｭ繧ｰ螟ｱ謨励・譛ｬ蜃ｦ逅・↓蠖ｱ髻ｿ縺輔○縺ｪ縺・
  }
}

```
