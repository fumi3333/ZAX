import { NextResponse } from "next/server";
import { findBestMatch } from "@/lib/rec/engine";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { vector } = body;

        if (!vector || !Array.isArray(vector) || vector.length !== 6) {
            return NextResponse.json({ error: "Invalid vector format" }, { status: 400 });
        }

        const matchResult = findBestMatch(vector);

        return NextResponse.json({
            success: true,
            match: matchResult
        });

    } catch (error) {
        console.error("Match API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
