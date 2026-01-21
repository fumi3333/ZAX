import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { inputs, biases } = body;

        if (!inputs || !Array.isArray(inputs)) {
            return NextResponse.json({ error: "Invalid inputs" }, { status: 400 });
        }

        const result = await analyzeEssence(inputs, biases);

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
