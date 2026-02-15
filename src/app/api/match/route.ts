import { NextResponse } from "next/server";
import { findTopMatches } from "@/lib/rec/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vector, topN = 5 } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const matches = await findTopMatches(vector, topN);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
