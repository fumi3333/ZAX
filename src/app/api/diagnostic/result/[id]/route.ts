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

    const isGuestUser = result.user.email.startsWith("guest_");
    const cookieStore = await cookies();
    const sessionUserId = verifySession(cookieStore.get("zax-session")?.value);

    // メール登録済みユーザーの結果は本人のみ閲覧可能
    // ゲストユーザーの結果はURLを知っていれば閲覧可能（共有機能のため）
    if (!isGuestUser) {
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
