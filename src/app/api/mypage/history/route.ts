import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashEmail } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const hashedEmail = hashEmail(email);
    const user = await prisma.user.findUnique({ where: { email: hashedEmail } });

    if (!user) {
      return NextResponse.json({ success: true, diagnostics: [] });
    }

    const diagnostics = await (prisma as any).diagnosticResult.findMany({
      where: { userId: user.id },
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
