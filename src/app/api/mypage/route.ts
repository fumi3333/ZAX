import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = verifySession(cookieStore.get("zax-session")?.value);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = prisma as {
      diagnosticResult?: { findMany: (args: any) => Promise<any> };
      reflection?: { findMany: (args: any) => Promise<any> };
    };

    const [diagnostics, reflections] = await Promise.all([
      p.diagnosticResult
        ? p.diagnosticResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
      p.reflection
        ? p.reflection.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
    ]);

    return NextResponse.json({
      diagnostics: diagnostics || [],
      reflections: reflections || [],
    });
  } catch (e) {
    console.error("Mypage fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
