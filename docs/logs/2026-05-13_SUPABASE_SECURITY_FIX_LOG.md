# 2026-05-13 Supabase セキュリティ脆弱性対応ログ

Supabase から検知されたセキュリティ脆弱性に関する対応内容を記録します。

## 1. 検出された脆弱性 (Supabase Security Advisories)

| 脆弱性 ID | 重要度 | 内容 | 影響を受ける箇所 |
| :--- | :--- | :--- | :--- |
| **rls_disabled_in_public** | **Critical** | Row Level Security (RLS) が有効になっておらず、API経由で誰でもテーブルを読み書き・削除できる状態。 | 全テーブル (`users`, `essence_vectors` など) |
| **sensitive_columns_exposed** | **Critical** | パスワードや個人識別情報などの機密情報が含まれる可能性のあるカラムが、アクセス制限なしでAPI公開されている。 | `users.email` (ハッシュ化済), `users.password` (`'email_only'`平文) |

---

## 2. 原因分析

- **データベース側**: Prismaのマイグレーションによって作成されたPostgreSQLテーブル群に対し、SupabaseのRow Level Security (RLS) が有効化されておらず、Anon Key (匿名APIキー) を使用してPostgREST API経由で直接データを窃取・改ざんできる余地があった。

- **アプリケーション側 (コード全般)**: 追加調査により、複数のAPIルートに下記のようなセキュリティ問題が発見された。

---

## 3. 実施した修正対応

### ① RLSセキュリティポリシーマイグレーションの作成（DB側）

[db/rls_migration.sql](file:///c:/ZAX/db/rls_migration.sql) を作成。
全テーブルにRLSを有効化し、各ユーザーが自分のデータのみアクセスできるポリシーを定義。

> **⚠️ 未適用**: このSQLはまだSupabase本番環境に反映されていない。下記「残った作業」を参照。

---

### ② アプリケーションコードの修正（コード側）

以下の問題を一括修正した。

#### [A] ハードコードされた平文パスワード

| ファイル | 問題 | 修正内容 |
| :--- | :--- | :--- |
| `api/diagnostic/submit/route.ts` | `password: "guest-password"` | `randomBytes(32).toString('hex')` に変更 |
| `api/auth/save-email/route.ts` | `password: 'email_only'` (3か所) | `randomBytes(32).toString('hex')` に変更 |
| `api/match/register/route.ts` | `password: 'email_only'` | `randomBytes(32).toString('hex')` に変更 |
| `api/feedback/route.ts` | ハードコードの `guest@example.com` と `guest_demo_user` | セッションCookieが存在する場合のみDB保存するよう変更 |

**なぜ問題か**: `'email_only'` や `'guest-password'` は誰でも知っているリテラル文字列。もしログイン機能が将来追加された場合、全ゲストアカウントをこの文字列で突破できてしまう。`randomBytes(32)` はログインが意図的に不可能な状態を保証する。

---

#### [B] 致命的なフォールバック: 他ユーザーへの成り済まし

**ファイル**: `api/diagnostic/submit/route.ts`

```diff
- const firstUser = await prisma.user.findFirst();
- if (firstUser) user = firstUser;  // ← 他ユーザーになりすます！
- else throw new Error("Could not create or find user");
+ // 作成失敗時は安全にエラーを返す
+ throw new Error('Could not create guest user');
```

**なぜ問題か**: ゲストユーザーの作成に失敗したとき、DBに存在する「最初のユーザー」を代わりに使っていた。これにより、エッジケースで診断結果が別人のアカウントに紐付けられる可能性があった。

---

#### [C] 認証なしでの他ユーザーのデータアクセス

**ファイル**: `api/diagnostic/result/[id]/route.ts`

診断結果のIDさえ知っていれば、誰でも（未ログインでも）他ユーザーの診断結果を取得できた。

```diff
+ // 認証: 自分の結果か、またはゲストユーザーの結果のみ閲覧可能
+ const isGuestUser = result.user.email.startsWith("guest_");
+ if (!isGuestUser) {
+   const sessionUserId = verifySession(cookieStore.get("zax-session")?.value);
+   if (!sessionUserId || sessionUserId !== result.userId) {
+     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
+   }
+ }
```

---

#### [D] 認証なしでの履歴取得 (クエリパラメーター `?email=`)

**ファイル**: `api/mypage/history/route.ts`

`GET /api/mypage/history?email=xxx@example.com` というリクエストを送るだけで、そのメールアドレスに紐付く診断履歴が誰でも取得できた。

```diff
- const email = searchParams.get('email');  // ← 認証なし
- const hashedEmail = hashEmail(email);
- const user = await prisma.user.findUnique({ where: { email: hashedEmail } });
+ // セッションCookieで認証
+ const userId = verifySession(cookieStore.get('zax-session')?.value);
+ if (!userId) return 401;
```

---

#### [E] 他ユーザーのメールアドレス漏洩

**ファイル**: `api/matching/candidates/route.ts`

マッチング候補のレスポンスに、候補ユーザーの（ハッシュ化済み）メールアドレスをそのまま含めていた。

```diff
- contactEmail: candidateUser?.email  // ハッシュ値でも漏洩はNG
+ hasEmail: hasRealEmail              // 「連絡可能かどうか」のフラグのみ返す
```

---

## 4. 再発防止の仕組み（同じミスが起きないように）

### ③ ユーザー生成の一元管理: `user-factory.ts`

**[src/lib/db/user-factory.ts](file:///c:/ZAX/src/lib/db/user-factory.ts)** を新設。

ユーザー作成の唯一の正規ルートとして機能する。すべてのAPIルートはここを経由する。

| 関数 | 用途 |
| :--- | :--- |
| `createGuestUser(sessionId)` | ゲストユーザー新規作成（ランダムパスワード・重複チェック付き） |
| `createEmailOnlyUser(hashedEmail)` | メールのみ登録（ランダムパスワード） |
| `upgradeGuestToEmailOnly(sessionId, email)` | ゲストをメール登録にアップグレード |
| `upgradeGuestToUser(sessionId, email, password, nickname)` | ゲストをフルアカウントにアップグレード（bcrypt必須） |

既存のAPIルート（`diagnostic/submit`, `save-email`, `match/register`）をこのファクトリー経由に移行済み。

**これにより**:
- `password: 'email_only'` や `password: 'guest-password'` のような書き方は factory の外では存在できない
- `findFirst()` フォールバックは factory 内で完全排除

---

### ④ 自動セキュリティスキャナー: `security-check.js`

**[scripts/security-check.js](file:///c:/ZAX/scripts/security-check.js)** を新設。

検出するパターン:
- ハードコードパスワード（`email_only`, `guest-password` 等）
- `prisma.user.findFirst()` のフォールバック
- ゲストメールのハードコード（`guest@example.com` 等）
- `connectOrCreate` + リテラルメール
- `?email=` クエリパラメーターによる認証なし履歴取得

**実行方法**:
```sh
npm run security:check
```

**git pre-commit hook**: `.git/hooks/pre-commit` に設定済み。コミット前に自動実行され、問題があればコミットをブロックする。

**動作確認（2026-05-13）**:
```
✅ 問題なし。すべてのセキュリティチェックをパスしました。
```

---

## 5. 残された作業 (Supabase本番環境へのRLS適用)

RLSのSQLマイグレーションがまだ本番に反映されていない（ブラウザの自動実行でログインセッション切れのため未実行）。

### 手順
1. **Supabase Dashboard** にサインイン → プロジェクト `sqejheryiyeqqejkmvkb` を開く
2. 左メニュー **SQL Editor** → **New Query**
3. [db/rls_migration.sql](file:///c:/ZAX/db/rls_migration.sql) の内容をコピー＆ペースト
4. **Run** ボタン (または Ctrl+Enter) をクリック
5. 実行後、**Advisors (Security)** ページで `rls_disabled_in_public` と `sensitive_columns_exposed` の警告がクリアされることを確認
