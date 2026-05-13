import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    // 認証: ストレートにセッションCookieで確認。?email=クエリは不要。
    const cookieStore = await cookies();
    const userId = verifySession(cookieStore.get('zax-session')?.value);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const diagnostics = await (prisma as any).diagnosticResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        synthesis: true,
        vector: true,
      }
    });

    return NextResponse.json({ success: true, diagnostics });

  } catch (error: any) {
    console.error('MyPage history error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
