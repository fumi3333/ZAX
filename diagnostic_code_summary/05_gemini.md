# Gemini クライアント - gemini.ts
パス: `src/lib/gemini.ts`

## 役割
- Google Gemini AI クライアントの初期化
- AI分析（analyzeEssence）、マッチング理由生成（generateMatchReasoning）などの関数

## ⚠️ 修正履歴
- 2026-02-26: モデル名 `gemini-2.5-flash` → `gemini-2.0-flash` に修正（「通信エラー」の根本原因だった）

## コード
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logGemini } from "./gemini-log";

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" }); // Updated to supported embedding model

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured. Cannot perform analysis.");
    }

    // 1. Generate V_display (6-dim) via LLM
    // Sanitize function to prevent simple injection
    const sanitize = (str: string) => str.replace(/`/g, "'").replace(/\$/g, "");
    
    const safeInputs = inputs.map(sanitize);

    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${sanitize(purpose)}"
    * Important: The user is seeking "${sanitize(purpose)}" functionality to maximize their life happiness. 
    * If purpose is "romance", prioritize Empathy and Chemistry cues.
    * If "happiness" (growth), prioritize Determination and Creativity.
    * If "friendship", prioritize Flexibility and Intuition.

    Fragments:
    1. ${safeInputs[0]}
    2. ${safeInputs[1]}
    3. ${safeInputs[2]}

    User Self-Reported Bias (0=Intuition, 100=Logic):
    1. ${biases[0]}
    2. ${biases[1]}
    3. ${biases[2]}
    * Use this bias to weight the "Logic" vs "Intuition" dimensions. High bias > 50 should boost Logic. Low bias < 50 should boost Intuition.

    Dimensions (0-100):
    - Logic (Logic & Structure)
    - Intuition (Insight & Pattern)
    - Empathy (Emotional Resonance)
    - Determination (Willpower & Drive)
    - Creativity (Novelty & Art)
    - Flexibility (Adaptability & Openness)

    Task:
    1. Estimate values (0-100) for each dimension, keeping the User Goal in mind for nuances.
    2. Generate a "Reasoning" summary (Max 100 chars, in JAPANESE) explaining the core personality trait detected in relation to their goal.
    3. Calculate a "Resonance Score" (0-100) representing potential for success in their chosen goal.

    Format: JSON only. Keys: "vector" (array), "reasoning" (string), "resonance_score" (number).
    `;

    try {
        const [result, embeddingResult] = await Promise.all([
            model.generateContent(prompt),
            embeddingModel.embedContent(inputs.join(" ")) // Generate V_essence (High-Dim)
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonStr) as AnalysisResult;

        const out = { ...parsed, embedding: embeddingResult.embedding.values.slice(0, 768) };
        logGemini("analyzeEssence", prompt, JSON.stringify(parsed), { inputs: safeInputs.length }).catch(() => {});
        return out;
    } catch (e: any) {
        console.error("Gemini API Error (Synthesis):", e);
        // Log the error to the DB for debugging
        await logGemini("error", prompt, `ERROR: ${e.message || String(e)}`, { stack: e.stack }).catch(() => {});
        
        // Throw error instead of returning mock data to avoid polluting database
        throw new Error("險ｺ譁ｭ API 縺ｮ騾壻ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲よ凾髢薙ｒ縺翫＞縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
    }
}

/** RAG鬚ｨ: 繝ｦ繝ｼ繧ｶ繝ｼ蛻・梵・狗嶌謇九・繝ｭ繝輔ぅ繝ｼ繝ｫ縺九ｉ逶ｸ諤ｧ縺ｮ逅・罰繧堤函謌・*/
export async function generateMatchReasoning(
    userSynthesis: string,
    partnerName: string,
    partnerBio: string,
    partnerTags: string[],
    similarityPercent: number,
    growthScore: number
): Promise<string> {
    if (!API_KEY) throw new Error("GOOGLE_API_KEY is not configured.");
    const prompt = `
縺ゅ↑縺溘・繝槭ャ繝√Φ繧ｰ繧｢繝峨ヰ繧､繧ｶ繝ｼ縺ｧ縺吶ゆｻ･荳九・諠・ｱ繧偵ｂ縺ｨ縺ｫ縲√↑縺懊％縺ｮ2莠ｺ縺檎嶌諤ｧ縺瑚憶縺・°縲・0譁・ｭ嶺ｻ･蜀・・譌･譛ｬ隱槭〒邁｡貎斐↓隱ｬ譏弱＠縺ｦ縺上□縺輔＞縲・
縲舌Θ繝ｼ繧ｶ繝ｼ縺ｮ諤ｧ譬ｼ蛻・梵縲・${userSynthesis.slice(0, 500)}

縲千嶌諤ｧ縺ｮ濶ｯ縺・嶌謇九・蜷榊燕: ${partnerName}
繝励Ο繝輔ぅ繝ｼ繝ｫ: ${partnerBio}
繧ｿ繧ｰ: ${partnerTags.join(", ")}

縲先焚蛟､縲・繝槭ャ繝∝ｺｦ: ${similarityPercent}%
謌宣聞繝昴ユ繝ｳ繧ｷ繝｣繝ｫ: ${growthScore}%

50譁・ｭ嶺ｻ･蜀・〒縲∝・菴鍋噪縺ｧ貂ｩ縺九＞謗ｨ阮ｦ逅・罰繧・譁・〒蜃ｺ蜉帙＠縺ｦ縺上□縺輔＞縲・SON縺ｯ荳崎ｦ√√ユ繧ｭ繧ｹ繝医・縺ｿ縲・`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 120) || `${partnerName}縺輔ｓ縺ｨ縺ｮ逶ｸ諤ｧ縺瑚憶縺・〒縺吶Ａ;
        logGemini("matchReasoning", prompt, text, { partnerName, similarityPercent, growthScore }).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Gemini match reasoning error:", e);
        return `${partnerName}縺輔ｓ縺ｯ${partnerBio} 繝槭ャ繝∝ｺｦ${similarityPercent}%縲Ａ;
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
    if (!API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
    }

    const prompt = `
    User Context Vector: [${currentVector.join(", ")}] (Logic, Intuition, Empathy, Determination, Creativity, Flexibility)
    User Feedback after interaction: "${feedback}"
    Selected Resonance Tags: "${tags.join(", ")}"
    * Tags like "Reassurance" should stabilize vector. "Challenge" should trigger larger delta. "Inspiration" increases Creativity.

    Task:
    1. Analyze the feedback to understand how the user's internal state has changed.
    2. Calculate a "Delta Vector" (6 dims) representing this shift. Positive means growth/increase, negative means decrease.
    3. Calculate the "New Vector" = Current + Delta. Ensure bounds 0-100.
    4. Calculate a "Growth Score" (0-100) based on the magnitude of positive, constructive change.

    Format: JSON only. Keys: "delta_vector" (array), "new_vector" (array), "growth_score" (number).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as DeltaResult;
    } catch (e) {
        console.error("Delta Calc Error", e);
        return {
            delta_vector: [0, 0, 0, 0, 0, 0],
            new_vector: currentVector,
            growth_score: 0
        };
    }
}

/** 繧､繝ｳ繧ｿ繝薙Η繝ｼ蝗樒ｭ斐°繧峨後≠縺ｪ縺溘・螟牙喧縲阪し繝槭Μ繝ｼ繧堤函謌・*/
export async function generateReflectionSummary(interviewText: string): Promise<string> {
    if (!API_KEY) return "縺ゅ↑縺溘・謖ｯ繧願ｿ斐ｊ縺瑚ｨ倬鹸縺輔ｌ縺ｾ縺励◆縲・;
    const prompt = `
莉･荳九・謖ｯ繧願ｿ斐ｊ蝗樒ｭ斐ｒ繧ゅ→縺ｫ縲√後≠縺ｪ縺溘′縺ｩ縺・､峨ｏ縺｣縺溘°縲阪ｒ50譁・ｭ嶺ｻ･蜀・・譌･譛ｬ隱槭〒隕∫ｴ・＠縺ｦ縺上□縺輔＞縲・貂ｩ縺九￥縲∝燕蜷代″縺ｪ陦ｨ迴ｾ縺ｧ縲・
縲先険繧願ｿ斐ｊ縲・${interviewText.slice(0, 500)}

50譁・ｭ嶺ｻ･蜀・・譁・〒縲・SON荳崎ｦ√√ユ繧ｭ繧ｹ繝医・縺ｿ縲・`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 80) || "縺ゅ↑縺溘・謖ｯ繧願ｿ斐ｊ縺瑚ｨ倬鹸縺輔ｌ縺ｾ縺励◆縲・;
        logGemini("reflectionSummary", prompt, text).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Reflection summary error:", e);
        return "縺ゅ↑縺溘・謖ｯ繧願ｿ斐ｊ縺瑚ｨ倬鹸縺輔ｌ縺ｾ縺励◆縲・;
    }
}

```
