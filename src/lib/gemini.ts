import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" }); // High-Dim Core

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not found. Using mock data.");
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。あなたの入力は非常に詩的で、論理性よりも直感を重視する傾向が見られます。",
            resonance_score: 88,
        };
    }

    // 1. Generate V_display (6-dim) via LLM
    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${purpose}"
    * Important: The user is seeking "${purpose}" functionality to maximize their life happiness. 
    * If purpose is "romance", prioritize Empathy and Chemistry cues.
    * If "happiness" (growth), prioritize Determination and Creativity.
    * If "friendship", prioritize Flexibility and Intuition.

    Fragments:
    1. ${inputs[0]}
    2. ${inputs[1]}
    3. ${inputs[2]}

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

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values // Attach High-Dim Vector
        };
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

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
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
