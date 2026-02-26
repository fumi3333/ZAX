import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { verifySession, encrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const { email, nickname } = await req.json().catch(() => ({}));
    
    const cookieStore = await cookies();
    const sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let isStudent = false;
    let domainHash = null;
    let userEmail = "";
    const userNickname = nickname || "Anonymous User";

    if (email && typeof email === 'string') {
        const lowerEmail = email.toLowerCase().trim();
        if (lowerEmail.endsWith('@musashino-u.ac.jp') || lowerEmail.endsWith('@stu.musashino-u.ac.jp')) {
            isStudent = true;
            domainHash = crypto.createHash('sha256').update('musashino-u.ac.jp').digest('hex');
        }
        userEmail = crypto.createHash('sha256').update(lowerEmail).digest('hex');
    }

    // セッションID（ユーザーID）に基づいて対象ユーザーを検索
    let user = await prisma.user.findUnique({
      where: { id: sessionId }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // すでに同じメアドを持つ本アカウントが存在する場合、
    // 今のゲストアカウントの本登録（Update）ではなく、そちらにマージするのが理想的ですが、
    // MVPの簡略化のため、既存メールがあればそれを更新するか、エラーにせずそのまま進めます。
    if (userEmail) {
        const existingEmailUser = await prisma.user.findUnique({ where: { email: userEmail }});
        if (existingEmailUser && existingEmailUser.id !== user.id) {
            // セキュリティ修正: パスワード確認なしにCookieを上書きするのはアカウント乗っ取りリスク。
            // 「すでに登録済み」そとゆるエラーを返す。
            return NextResponse.json({
                success: false,
                error: 'このメールアドレスは既に別のアカウントで登録されています。'
            }, { status: 409 });
        }
    }

    const updateData: any = {
        isCampusMatchRegistered: true,
        nickname: userNickname,
    };
    if (userEmail) {
        updateData.email = userEmail;
    }
    if (email && typeof email === 'string') {
        updateData.contactEmail = encrypt(email.toLowerCase().trim());
    }
    if (isStudent) {
        updateData.isStudent = true;
        updateData.domainHash = domainHash;
        updateData.affiliation = "Musashino Univ.";
    }

    // 現在のゲストアカウントを本登録
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Campus Match Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
