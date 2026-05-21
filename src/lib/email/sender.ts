// Resend (https://resend.com) を使ったメール送信
// RESEND_API_KEY が未設定なら no-op（開発時の安全策）

import { decrypt } from '@/lib/crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'onboarding@resend.dev';

interface SendArgs {
  to: string;        // 平文メアド or 暗号化メアド（encryptedTo=true指定で復号）
  subject: string;
  html: string;
  encryptedTo?: boolean;
}

export async function sendEmail({ to, subject, html, encryptedTo }: SendArgs): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skip sending. Subject:', subject);
    return false;
  }

  const recipient = encryptedTo ? safeDecrypt(to) : to;
  if (!recipient || !recipient.includes('@')) {
    console.warn('[email] Invalid recipient');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipient,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('[email] Resend API error:', res.status, text);
      return false;
    }
    return true;
  } catch (e: any) {
    console.warn('[email] Send error:', e?.message);
    return false;
  }
}

function safeDecrypt(encrypted: string): string | null {
  try { return decrypt(encrypted); } catch { return null; }
}

// マッチ通知メールテンプレート
export function matchNotificationHtml(args: {
  matchScore: number;  // 補完性スコア（0-100）
  matchReason: string; // AIによる相性説明
}): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL || 'https://zax.fumiproject.dev';
  return `
<!DOCTYPE html>
<html><body style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #0f172a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 12px; letter-spacing: 0.3em; color: #94a3b8; margin: 0;">ZAX</h1>
  </div>
  <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
    <p style="font-size: 12px; font-weight: bold; color: #94a3b8; letter-spacing: 0.2em; margin: 0 0 8px;">NEW MATCH</p>
    <h2 style="font-size: 28px; font-weight: 900; margin: 0 0 16px;">補完性 ${args.matchScore}%</h2>
    <p style="color: #475569; line-height: 1.7; font-size: 14px;">${args.matchReason}</p>
    <a href="${url}/mypage" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">マイページで詳細を見る →</a>
  </div>
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
    このメールは ZAX に登録されたメールアドレスに送信されています。<br>
    配信停止: <a href="${url}/unsubscribe" style="color: #94a3b8;">こちら</a>
  </p>
</body></html>`;
}
