import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find the current user and their latest diagnostic result
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: {
        diagnosticResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user || user.diagnosticResults.length === 0) {
      return NextResponse.json({ success: false, error: 'No diagnostic results found' }, { status: 404 });
    }

    const latestResult = user.diagnosticResults[0];
    let userVector6d: number[];
    try {
      userVector6d = JSON.parse(latestResult.vector);
      if (!Array.isArray(userVector6d) || userVector6d.length !== 6) throw new Error();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid vector data' }, { status: 500 });
    }

    // Search for top 3 similar profiles
    // In pgvector, we fetch more to filter out the current user, then take 3
    const similarRecords: any[] = await vectorStore.searchSimilar(userVector6d, 10);
    
    // Filter out current user and map to Candidate format
    const candidates = [];
    for (const record of similarRecords) {
      if (record.userId === user.id) continue;
      if (candidates.length >= 3) break;

      // Fetch user details for contact info and name/affiliation (if available)
      const candidateUser = await prisma.user.findUnique({
        where: { id: record.userId },
        select: { email: true }
      });

      // Default pseudo profile info since we don't have separate profile table yet
      let nickname = "匿名ユーザー";
      let affiliation = "武蔵野大学";
      let contactEmail = candidateUser?.email || null;

      // Make sure contact email is only shown if it's not a guest email
      if (contactEmail && contactEmail.startsWith('guest_')) {
        contactEmail = null;
      }

      candidates.push({
        userId: record.userId,
        nickname,
        affiliation,
        reasoning: record.reasoning || "価値観の方向性が共鳴しています。",
        statsVector: record.vectorJson,
        distance: record.distance,
        contactEmail
      });
    }

    return NextResponse.json({ success: true, candidates });

  } catch (error: any) {
    console.error('Matching Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
