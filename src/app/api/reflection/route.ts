import { NextResponse } from "next/server";
import { generateReflectionSummary } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const { interviewText } = await request.json();
        if (!interviewText || typeof interviewText !== "string") {
            return NextResponse.json({ error: "interviewText required" }, { status: 400 });
        }
        const summary = await generateReflectionSummary(interviewText);
        return NextResponse.json({ summary });
    } catch (error) {
        console.error("Reflection API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
