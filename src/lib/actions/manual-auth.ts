'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function manualLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. バリデーション
    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "無効な入力データです。" };
    }

    // 2. ユーザー検索
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 3. パスワード照合 (ハッシュ比較)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 4. セッション発行 (HTTP-only Cookie)
    // 注意: 本番環境ではJWTやLucia Auth等のライブラリ推奨だが、ここでは簡易実装
    (await cookies()).set('zax-session', user.id, { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    redirect('/');
}

export async function manualRegister(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "パスワードは6文字以上で入力してください。" };
    }

    // ドメイン制限 (武蔵野大学)
    if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
        return { message: "武蔵野大学のメールアドレスのみ登録可能です。" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { message: "このメールアドレスは既に登録されています。" };
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });

    return { message: "登録成功！ログインしてください。" };
}

export async function logout() {
  (await cookies()).delete('zax-session');
  redirect('/login');
}
