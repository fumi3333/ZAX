import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession, decrypt } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { vectors: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.isStudent || !user.domainHash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Student verification required',
        message: 'この機能を利用するには、学内メールアドレスでの認証が必要です。' 
      }, { status: 403 });
    }

    const latestVector = user.vectors[0];
    let vector: number[] = [];
    
    if (latestVector && latestVector.vectorJson) {
        try {
            const parsed = JSON.parse(latestVector.vectorJson);
            if (Array.isArray(parsed)) vector = parsed;
        } catch (e) {
            console.error("Vector parsing error", e);
        }
    }
    
    if (vector.length === 0) {
        // Fallback or error handling
        return NextResponse.json({ success: false, error: 'No vector data found' }, { status: 400 });
    }

    const rawCandidates = await vectorStore.searchCandidates(
        vector,
        user.domainHash,
        10,
        user.id
    ) as any[];

    const candidates = rawCandidates.map(c => ({
        ...c,
        contactEmail: c.contactEmail ? decrypt(c.contactEmail) : null
    }));

    return NextResponse.json({ success: true, candidates });

  } catch (error: any) {
    console.error('Candidate fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
