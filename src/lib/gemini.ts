import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[]): Promise<AnalysisResult> {
    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not found. Using mock data.");
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。あなたの入力は非常に詩的で、論理性よりも直感を重視する傾向が見られます。",
            resonance_score: 88,
        };
    }

    const prompt = `
    Analyze the following 3 "Essence Fragments" of a person:
    ${inputs.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

    Based on these, generate a JSON response with:
    1. "vector": An array of 6 integers (0-100) representing these traits in order: [Logic, Intuition, Empathy, Determination, Creativity, Flexibility].
    2. "reasoning": A short Japanese text (max 100 chars) explaining why this person matches with someone who is "Complimentary". Focus on hidden potential.
    3. "resonance_score": A calculated integer (0-100) representing potential for growth.

    Format: JSON only.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Simple cleaning for JSON parsing if markdown is included
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as AnalysisResult;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // Fallback on error
        return {
            vector: [50, 50, 50, 50, 50, 50],
            reasoning: "解析中にエラーが発生しました。",
            resonance_score: 50
        };
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50]): Promise<DeltaResult> {
    if (!API_KEY) {
        return {
            delta_vector: [5, -2, 10, 0, 5, 5],
            new_vector: currentVector.map((v, i) => Math.min(100, Math.max(0, v + (i % 2 === 0 ? 5 : -2)))),
            growth_score: 15
        };
    }

    const prompt = `
    User Context Vector: [${currentVector.join(", ")}] (Logic, Intuition, Empathy, Determination, Creativity, Flexibility)
    User Feedback after interaction: "${feedback}"

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
