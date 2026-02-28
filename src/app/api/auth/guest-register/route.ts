import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'セッションが見つかりません' }, { status: 401 });
    }

    const { email, password, nickname } = await req.json();

    if (!email || !password || !nickname) {
      return NextResponse.json({ success: false, error: '必須項目が不足しています' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'パスワードは6文字以上で入力してください' }, { status: 400 });
    }

    // Domain check
    if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
      return NextResponse.json({ success: false, error: '武蔵野大学のメールアドレスのみ登録可能です' }, { status: 400 });
    }

    // Check if email already used by a REAL user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && !existing.email.startsWith('guest_')) {
       return NextResponse.json({ success: false, error: 'このメールアドレスは既に登録されています' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the guest user record to a real user
    await prisma.user.update({
      where: { id: sessionId },
      data: {
        email,
        password: hashedPassword,
        nickname
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Guest Register Error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
