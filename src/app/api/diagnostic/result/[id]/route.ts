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
      include: { user: true }
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      userId: result.userId,
      isGuest: result.user.email.startsWith("guest_"),
      synthesis: result.synthesis,
      answers,
      vector: result.vector ? JSON.parse(result.vector) : null,
    });
  } catch (e) {
    console.error("Diagnostic result fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
