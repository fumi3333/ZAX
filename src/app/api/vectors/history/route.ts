
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionId;

    // 2. Fetch Vector History
    // We want the vectors ordered by time to show evolution.
    // We should probably limit to last N vectors to avoid huge payload, but for now let's get all (or last 50).
    const vectors = await prisma.essenceVector.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: {
            id: true,
            vectorJson: true, 
            statsVector: true, 
            reasoning: true,
            resonanceScore: true,
            createdAt: true
        }
    } as any);

    // Parse vectorJson to array
    const formattedVectors = vectors.map((v: any) => ({
        ...v,
        vector: JSON.parse(v.vectorJson)
    }));

    return NextResponse.json({ 
        success: true, 
        data: formattedVectors 
    });

  } catch (error: any) {
    console.error('Vector History API Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
