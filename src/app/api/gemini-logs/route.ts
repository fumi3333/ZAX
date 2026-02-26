import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

/** 管理用: Geminiログ一覧（簡易。本番では認証・権限が必要） */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // セキュリティ修正: 管理者専用キー(ADMIN_API_KEY)を用いた認証
    const adminKey = request.headers.get("Authorization") || searchParams.get("key");
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: "Unauthorized access to logs" }, { status: 401 });
    }

    const type = searchParams.get("type");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));

    const p = prisma as { geminiLog?: { findMany: (args: any) => Promise<any> } };
    if (!p?.geminiLog) {
      return NextResponse.json({ logs: [] });
    }

    const logs = await p.geminiLog.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (e) {
    console.error("Gemini logs fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
