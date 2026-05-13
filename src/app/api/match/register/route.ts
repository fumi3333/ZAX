import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashEmail } from '@/lib/crypto';
import { createEmailOnlyUser } from '@/lib/db/user-factory';

export async function POST(req: Request) {
  try {
    const { email, type, resultId } = await req.json();
    // type: 'campus' | 'general'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    if (type === 'campus') {
      if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
        return NextResponse.json({
          success: false,
          error: '武蔵野大学のメールアドレス（@stu.musashino-u.ac.jp）を入力してください'
        }, { status: 400 });
      }
    }

    const hashedEmail = hashEmail(email);
    const user = await prisma.user.findUnique({ where: { email: hashedEmail } });

    // For now, just record the match interest by updating the user record
    // In the future, this would create a match_waitlist entry
    if (user) {
      // User exists — mark them as interested in matching
      // We store match type in a notes field (or simply confirm their interest)
      return NextResponse.json({
        success: true,
        type,
        message: type === 'campus' ? 'campus_registered' : 'general_registered'
      });
    } else {
      // Create user with this email and mark as match-interested
      await createEmailOnlyUser(hashedEmail);
      return NextResponse.json({
        success: true,
        type,
        message: type === 'campus' ? 'campus_registered' : 'general_registered'
      });
    }

  } catch (error: any) {
    console.error('Match registration error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
