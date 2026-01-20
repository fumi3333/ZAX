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
