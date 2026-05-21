/**
 * user-factory.ts
 *
 * ユーザー生成の唯一の正規ルート。
 * すべてのAPIルートはここを経由してユーザーを作成すること。
 *
 * ❌ やってはいけないこと:
 *   - prisma.user.create({ data: { password: "email_only" } })
 *   - prisma.user.create({ data: { password: "guest-password" } })
 *   - prisma.user.findFirst() をフォールバックに使う
 *
 * ✅ やること:
 *   - createGuestUser() / createEmailOnlyUser() / upgradeGuestToUser() を使う
 */

import { randomBytes } from 'crypto';
import { prisma } from './client';
import type { User } from '@prisma/client';

/**
 * ログイン不可の強固なランダムパスワードを生成する。
 * "email_only" や "guest-password" のようなリテラルは絶対に使わない。
 */
function generateLockedPassword(): string {
  return `locked_${randomBytes(32).toString('hex')}`;
}

/**
 * ゲストユーザーを作成する。
 * - ゲストIDは guest_{timestamp}_{random} 形式
 * - メールは guest_{id}@musashino-u.ac.jp 形式
 * - パスワードはランダムロック（ログイン不可）
 *
 * @throws Error - 作成失敗時はエラーをスローする。他ユーザーへのフォールバックは絶対にしない。
 */
export async function createGuestUser(sessionId: string): Promise<User> {
  // sessionIdが既に"guest_"で始まる場合は重複しない
  const emailPrefix = sessionId.startsWith('guest_') ? sessionId : `guest_${sessionId}`;
  const email = `${emailPrefix}@musashino-u.ac.jp`;

  // 既存チェック（重複防止）
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  // 存在しなければ新規作成
  return await prisma.user.create({
    data: {
      id: sessionId,
      email,
      password: generateLockedPassword(),
    },
  });
}

/**
 * メールアドレスのみで登録するユーザーを作成する。
 * パスワードはランダムロック（メール認証フローのみでログイン可能にする前提）。
 *
 * @throws Error - 重複時やDB障害時はエラーをスロー
 */
export async function createEmailOnlyUser(
  hashedEmail: string,
  contactEmail?: string
): Promise<User> {
  return await prisma.user.create({
    data: {
      email: hashedEmail,
      password: generateLockedPassword(),
      ...(contactEmail ? { contactEmail } : {}),
    },
  });
}

/**
 * ゲストセッションを本登録ユーザーにアップグレードする。
 * - 既存ゲストユーザーが見つからない場合は新規作成
 * - bcryptでハッシュ化されたパスワードが必要（フルアカウント登録用）
 */
export async function upgradeGuestToUser(
  sessionId: string,
  hashedEmail: string,
  hashedPassword: string,
  nickname?: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: sessionId },
      data: {
        email: hashedEmail,
        password: hashedPassword,
        nickname,
      },
    });
  } catch {
    return await prisma.user.create({
      data: {
        email: hashedEmail,
        password: hashedPassword,
        nickname,
      },
    });
  }
}

/**
 * メールのみでゲストセッションをアップグレードする（パスワードなし登録用）。
 * パスワードはランダムロック（ログイン不可）。
 */
export async function upgradeGuestToEmailOnly(
  sessionId: string,
  hashedEmail: string,
  contactEmail?: string
): Promise<User> {
  const lockedPassword = generateLockedPassword();
  try {
    return await prisma.user.update({
      where: { id: sessionId },
      data: {
        email: hashedEmail,
        password: lockedPassword,
        ...(contactEmail ? { contactEmail } : {}),
      },
    });
  } catch {
    return await createEmailOnlyUser(hashedEmail, contactEmail);
  }
}
