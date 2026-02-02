import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";
import { vectorStore } from "@/lib/db/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { inputs, biases } = body;

        if (!inputs || !Array.isArray(inputs)) {
            return NextResponse.json({ error: "Invalid inputs" }, { status: 400 });
        }

        const result = await analyzeEssence(inputs, biases);

        // [DB] Persist the analysis result
        // For MVP, we generate a session-based ID or random guest ID
        // In production, this comes from auth()
        const guestId = "guest_demo_" + new Date().getTime();
        
        await vectorStore.saveEmbedding(guestId, result.vector, 'personality');

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
