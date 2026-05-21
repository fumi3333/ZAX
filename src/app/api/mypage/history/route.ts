import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { verifySession, hashEmail } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const emailParam = url.searchParams.get('email');

    let userId: string | null = null;

    if (emailParam && emailParam.includes('@')) {
      // メールアドレスで検索（別端末・Cookie なし対応）
      const hashed = hashEmail(emailParam);
      const user = await prisma.user.findUnique({ where: { email: hashed } });
      if (!user) {
        return NextResponse.json({ success: true, diagnostics: [] });
      }
      userId = user.id;
    } else {
      // セッションCookieで検索
      const cookieStore = await cookies();
      userId = verifySession(cookieStore.get('zax-session')?.value);
    }

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
