import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';

export async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('zax-session');

  // セッションCookieが存在しない場合はログインページへ
  if (!session?.value) {
    redirect('/login');
  }

  // DBに実際に存在する「本登録」ユーザーかを確認（ゲストや不正なセッションを弾く）
  const user = await prisma.user.findUnique({
    where: { id: session.value },
  });

  if (!user || user.email.startsWith('guest_')) {
    redirect('/login');
  }

  return user;
}
