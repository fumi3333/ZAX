import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.diagnosticResult.findUnique({
      where: { id },
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      synthesis: result.synthesis,
      answers,
    });
  } catch (e) {
    console.error("Diagnostic result fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
