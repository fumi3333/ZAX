# 2026-05-21 メール送信基盤の追加

## 背景

6月13日のマッチング機能開放に向けて、ユーザーにマッチ通知メールを送る必要が発生。
しかし既存DBではメアドはSHA-256ハッシュ化されており復号不可能。
→ ローンチ前に「暗号化された送信用メアド」を別カラムで保存する設計に変更。

---

## 変更内容

### 1. スキーマ変更
`prisma/schema.prisma` — Userモデルに `contactEmail` を追加
```prisma
model User {
  email        String   @unique // SHA-256 hashed (検索用)
  contactEmail String?  // AES-256-CBC 暗号化された送信用メール
  ...
}
```

### 2. マイグレーション適用
- ファイル: `prisma/migration_add_contact_email.sql`
- 内容: `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;`
- Supabase本番DBに適用済み ✅

### 3. 登録API更新
`src/app/api/auth/save-email/route.ts`
- 登録時に `encrypt(email)` を呼んで暗号化メアドを保存
- 既存ユーザーで `contactEmail` が空なら埋める

`src/app/api/match/register/route.ts`
- マッチ登録時にも同様に暗号化メアドを保存

`src/lib/db/user-factory.ts`
- `createEmailOnlyUser(hashedEmail, contactEmail?)`
- `upgradeGuestToEmailOnly(sessionId, hashedEmail, contactEmail?)`
- 両者で暗号化メアドを保存可能に

### 4. メール送信ユーティリティ追加
`src/lib/email/sender.ts`
- Resend.com API ラッパー
- `sendEmail({ to, subject, html, encryptedTo })` インターフェース
- `encryptedTo: true` 指定で暗号化メアドを自動復号
- `matchNotificationHtml({ matchScore, matchReason })` テンプレート
- `RESEND_API_KEY` 未設定時は no-op（安全）

---

## 必要な環境変数（後で設定）

| 変数 | 用途 | 設定先 |
|------|------|--------|
| `RESEND_API_KEY` | Resend API 認証 | Vercel |
| `RESEND_FROM` | 送信元メアド | Vercel（デフォルト: onboarding@resend.dev） |
| `NEXT_PUBLIC_BASE_URL` | メール内リンク用 | Vercel（デフォルト: https://zax.fumiproject.dev） |

---

## 今後のステップ（マッチング開放時）

1. Resendアカウント作成 → APIキー取得
2. Vercelに `RESEND_API_KEY` を追加
3. （任意）`zax.fumiproject.dev` のDNS設定 → 独自送信元
4. マッチング判定ロジックを実装 → 候補が見つかった時に `sendEmail()` 呼び出し

---

## セキュリティ的な設計判断

| 項目 | 設計 | 理由 |
|------|------|------|
| 検索用メール | SHA-256ハッシュ | 漏洩しても復元不可（プライバシー優先） |
| 送信用メール | AES-256-CBC暗号化 | `ENCRYPTION_KEY` がないと復号不可（鍵の管理が前提） |
| `ENCRYPTION_KEY` | Vercel環境変数のみ | コードには絶対書かない |

→ Supabase漏洩しても `contactEmail` は暗号文。鍵さえ守れば実害なし。
