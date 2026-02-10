import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";
import { vectorStore } from "@/lib/db/client";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";

export const runtime = "nodejs";

// Input Validation Schema
const AnalyzeRequestSchema = z.object({
    inputs: z.array(z.string().min(1, "Input cannot be empty")).min(1, "At least one input is required"),
    biases: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Input Validation (Zod)
        const validation = AnalyzeRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Invalid inputs", 
                details: validation.error.issues 
            }, { status: 400 });
        }

        const { inputs, biases } = validation.data;

        // 2. AI Analysis
        const numericBiases = biases?.map((b) => Number(b));
        const result = await analyzeEssence(inputs, numericBiases);

        // [DB] Persist the analysis result
        // For MVP, we generate a session-based ID or random guest ID
        const guestId = "guest_demo_" + new Date().getTime();
        
        // 3. Data Encryption (Encrypt sensitive reasoning before saving)
        // We clone the vector data to avoid mutating the response sent back to client (optional, but safer)
        const encryptedReasoning = encrypt(result.reasoning);

        // Save with encrypted reasoning
        await vectorStore.saveEmbedding(guestId, {
            ...result,
            reasoning: encryptedReasoning
        }, 'personality');

        // Return PLAIN text to the user (they need to see their own result immediately)
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
