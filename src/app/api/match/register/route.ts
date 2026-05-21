import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db/client';
import { hashEmail, encrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const { email, type, campus, grade, age } = await req.json();
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
    const encryptedContactEmail = encrypt(email); // 送信用に暗号化
    const campusLabel = campus === 'ariake' ? '有明キャンパス' : campus === 'musashino' ? '武蔵野キャンパス' : null;
    const user = await prisma.user.findUnique({ where: { email: hashedEmail } });
    // campusLabel は レスポンス表示用のみ

    // grade: キャンパスマッチ用学年 (1〜5), age: 通常マッチ用年齢
    const gradeValue = grade ? Number(grade) : null;
    const ageValue = age ? Number(age) : null;

    if (user) {
      const updateData: any = {};
      if (campus) updateData.campus = campus;
      if (gradeValue) updateData.grade = gradeValue;
      // age は grade フィールドに統一して保存（一般ユーザーの場合）
      if (ageValue && !gradeValue) updateData.grade = ageValue;
      if (!user.contactEmail) updateData.contactEmail = encryptedContactEmail;
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { email: hashedEmail }, data: updateData });
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
          contactEmail: encryptedContactEmail,
          password: `locked_${randomBytes(32).toString('hex')}`,
          ...(campus ? { campus } : {}),
          ...(gradeValue ? { grade: gradeValue } : {}),
          ...(ageValue && !gradeValue ? { grade: ageValue } : {}),
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
