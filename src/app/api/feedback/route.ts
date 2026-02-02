import { NextResponse } from "next/server";
import { calculateDeltaVector } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";

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
        try {
            const userId = "guest_demo_user"; // Fixed for MVP demo
            await prisma.feedback.create({
                data: {
                    content: feedback,
                    deltaVector: JSON.stringify(deltaResult.delta_vector),
                    growthScore: deltaResult.growth_score,
                    user: {
                        connectOrCreate: {
                            where: { id: userId },
                            create: { id: userId, email: "guest@example.com" }
                        }
                    }
                }
            });
        } catch (dbError) {
            console.error("DB Save Error:", dbError);
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
