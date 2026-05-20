import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashEmail } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const { email, type, campus, resultId } = await req.json();
    // campus: 'musashino' | 'ariake' | undefined
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
    const campusLabel = campus === 'ariake' ? '有明キャンパス' : campus === 'musashino' ? '武蔵野キャンパス' : null;
    const user = await prisma.user.findUnique({ where: { email: hashedEmail } });

    if (user) {
      // キャンパス情報があればnicknameに保存
      if (campusLabel) {
        await prisma.user.update({
          where: { email: hashedEmail },
          data: { nickname: campusLabel }
        });
      }
      return NextResponse.json({
        success: true,
        type,
        campus: campusLabel,
        message: type === 'campus' ? 'campus_registered' : 'general_registered'
      });
    } else {
      await prisma.user.create({
        data: {
          email: hashedEmail,
          password: `locked_${require('crypto').randomBytes(32).toString('hex')}`,
          ...(campusLabel ? { nickname: campusLabel } : {}),
        }
      });
      return NextResponse.json({
        success: true,
        type,
        campus: campusLabel,
        message: type === 'campus' ? 'campus_registered' : 'general_registered'
      });
    }

  } catch (error: any) {
    console.error('Match registration error:', error);
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
