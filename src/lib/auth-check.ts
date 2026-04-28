import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { verifySession } from '@/lib/crypto';

export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('zax-session');

  // セッションCookieが存在しない場合はログインページへ
  if (!sessionCookie?.value) {
    redirect('/login');
  }

  // 署名の検証
  const userId = verifySession(sessionCookie.value);
  if (!userId) {
    // 署名が無効な場合は不正アクセスとみなしてログインへ
    redirect('/login');
  }

  // DBに実際に存在する「本登録」ユーザーかを確認
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.email.startsWith('guest_')) {
    redirect('/login');
  }

  return user;
}
