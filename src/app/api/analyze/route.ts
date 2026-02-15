import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";
import { vectorStore } from "@/lib/db/client";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// Input Validation Schema
const AnalyzeRequestSchema = z.object({
    inputs: z.array(z.string().min(1, "Input cannot be empty")).min(1, "At least one input is required"),
    biases: z.array(z.union([z.string(), z.number()])).optional(),
    purpose: z.string().optional(),
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

        const { inputs, biases, purpose } = validation.data;

        // 2. AI Analysis
        const numericBiases = biases?.map((b) => Number(b));
        const result = await analyzeEssence(inputs, numericBiases, purpose || "general");

        // [DB] Persist the analysis result
        const cookieStore = await cookies();

        const sessionId = cookieStore.get('zax-session')?.value;
        const userId = sessionId || "guest_" + new Date().getTime();
        
        // 3. Data Encryption (Encrypt sensitive reasoning before saving)
        const encryptedReasoning = encrypt(result.reasoning);

        // Save with encrypted reasoning
        await vectorStore.saveEmbedding(
            userId,
            result.vector,
            encryptedReasoning,
            result.resonance_score || 0
        );

        // Return PLAIN text to the user (they need to see their own result immediately)
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
