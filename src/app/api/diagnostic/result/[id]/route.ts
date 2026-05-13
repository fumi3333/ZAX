import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/crypto";

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

    // 認証: 自分の結果か、またはゲストユーザーの結果のみ開悧可能
    const isGuestUser = result.user.email.startsWith("guest_");
    if (!isGuestUser) {
      const cookieStore = await cookies();
      const sessionUserId = verifySession(cookieStore.get("zax-session")?.value);
      if (!sessionUserId || sessionUserId !== result.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      userId: result.userId,
      isGuest: isGuestUser,
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
