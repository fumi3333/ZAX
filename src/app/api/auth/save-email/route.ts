import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { hashEmail } from '@/lib/crypto';
import { createEmailOnlyUser, upgradeGuestToEmailOnly } from '@/lib/db/user-factory';

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
      // ゲストセッションをメールのみ登録にアップグレード（user-factory経由）
      const upgraded = await upgradeGuestToEmailOnly(sessionId, hashedEmail);
      userId = upgraded.id;
    } else {
      // セッションなし → 新規ユーザー作成（user-factory経由）
      const newUser = await createEmailOnlyUser(hashedEmail);
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
