import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { hashEmail } from '@/lib/crypto';

// メールアドレスだけで登録（パスワードなし）
// 変遷記録・おみくじ保存のためのシンプルな登録API
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    const { email, resultId } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const hashedEmail = hashEmail(email);

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email: hashedEmail } });
    if (existing) {
      // Already registered — link this result to existing user if we have a result
      if (resultId) {
        try {
          await prisma.diagnosticResult.update({
            where: { id: resultId },
            data: { userId: existing.id }
          });
        } catch { /* might already be linked */ }
      }
      return NextResponse.json({ success: true, message: 'already_registered' });
    }

    let userId: string;

    if (sessionId) {
      // Upgrade guest session to real user
      try {
        const updated = await prisma.user.update({
          where: { id: sessionId },
          data: {
            email: hashedEmail,
            password: 'email_only', // no password for email-only registration
          }
        });
        userId = updated.id;
      } catch {
        // Session user doesn't exist, create new
        const newUser = await prisma.user.create({
          data: {
            email: hashedEmail,
            password: 'email_only',
          }
        });
        userId = newUser.id;
      }
    } else {
      // No session, create new user
      const newUser = await prisma.user.create({
        data: {
          email: hashedEmail,
          password: 'email_only',
        }
      });
      userId = newUser.id;
    }

    // Link the diagnostic result to this user
    if (resultId) {
      try {
        await prisma.diagnosticResult.update({
          where: { id: resultId },
          data: { userId }
        });
      } catch { /* might not exist */ }
    }

    return NextResponse.json({ success: true, message: 'registered' });

  } catch (error: any) {
    console.error('Save Email Error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
