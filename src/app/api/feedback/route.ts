import { NextResponse } from "next/server";
import { calculateDeltaVector } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { feedback, currentVector, tags } = body;

        if (!feedback) {
            return NextResponse.json({ error: "Feedback required" }, { status: 400 });
        }

        // Calculate Delta Vector based on feedback emotional shift
        const deltaResult = await calculateDeltaVector(feedback, currentVector, tags);

        // [DB] Persist Feedback & Delta (Prisma)
        // NOTE: ゲストユーザーはハードコードしない。
        // セッションIDが存在する場合のみDBに保存する。
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const sessionUserId = cookieStore.get("zax-session")?.value;

        if (sessionUserId) {
            try {
                await prisma.feedback.create({
                    data: {
                        content: feedback,
                        deltaVector: JSON.stringify(deltaResult.delta_vector),
                        growthScore: deltaResult.growth_score,
                        userId: sessionUserId,
                    }
                });
            } catch (dbError) {
                console.error("DB Save Error:", dbError);
            }
        }

        return NextResponse.json({
            success: true,
            delta: deltaResult.delta_vector,
            new_vector: deltaResult.new_vector,
            growth_score: deltaResult.growth_score
        });

    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
