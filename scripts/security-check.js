#!/usr/bin/env node
/**
 * scripts/security-check.js
 *
 * セキュリティ上のアンチパターンをコードベース全体でスキャンするスクリプト。
 * git pre-commit hook または CI で実行することを想定。
 *
 * 使い方:
 *   node scripts/security-check.js
 *
 * 終了コード:
 *   0 = 問題なし
 *   1 = 問題あり（CIでブロック）
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');

// ============================================================
// スキャン対象のアンチパターン定義
// ============================================================
const RULES = [
  {
    id: 'HARDCODED_PASSWORD',
    description: 'ハードコードされた平文パスワード',
    detail: 'password フィールドにリテラル文字列を渡している。randomBytes を使うこと。',
    pattern: /password:\s*['"`](email_only|guest-password|password|admin|test|123|abc)['"` ]/i,
    fix: 'src/lib/db/user-factory.ts の createGuestUser / createEmailOnlyUser を使ってください。',
  },
  {
    id: 'FINDIRST_FALLBACK',
    description: '他ユーザーへの危険なフォールバック',
    detail: 'findFirst() をユーザー検索のフォールバックに使っている。別人のデータを返す可能性がある。',
    pattern: /prisma\.user\.findFirst\(\)/i,
    fix: 'ユーザーが見つからない・作成できない場合は、エラーをスローしてください。',
  },
  {
    id: 'GUEST_EMAIL_HARDCODED',
    description: 'ゲストメールのハードコード',
    detail: '"guest@example.com" のようなリテラルアドレスをDBに書き込んでいる。',
    pattern: /['"`]guest@[a-zA-Z0-9.-]+['"`]/i,
    fix: 'src/lib/db/user-factory.ts の createGuestUser を使ってください。',
  },
  {
    id: 'CONNECTORCREATE_WITH_LITERAL_EMAIL',
    description: 'connectOrCreate でダミーメールを直接作成',
    detail: 'connectOrCreate の create 内でリテラルメールを使っている。',
    pattern: /connectOrCreate[\s\S]{0,200}create:\s*\{[\s\S]{0,100}email:\s*['"`][a-zA-Z]/i,
    fix: 'user-factory.ts 経由でユーザーを事前に作成・取得してから、userId で connect してください。',
  },
  {
    id: 'UNAUTHENTICATED_HISTORY_BY_EMAIL',
    description: '?email= クエリパラメーターによる認証なし履歴取得',
    detail: 'URLパラメーターのemailだけで履歴を返す実装はなりすましができる。',
    pattern: /searchParams\.get\(['"`]email['"`]\)[\s\S]{0,300}findMany/i,
    fix: 'セッションCookieの verifySession() で認証してください。',
  },
];

// ============================================================
// スキャン実行
// ============================================================
let hasError = false;
const violations = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const rawLines = raw.split('\n');

      // コメント行を除外したコンテンツで検索（誤検知防止）
      const codeLines = rawLines.map(line => {
        // 行コメント // 以降を削除
        const commentIdx = line.indexOf('//');
        return commentIdx >= 0 ? line.slice(0, commentIdx) : line;
      });
      // ブロックコメント /* ... */ を削除
      const codeContent = codeLines.join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

      for (const rule of RULES) {
        if (!rule.pattern.test(codeContent)) continue;
        // 行番号を特定（コード部分で一致した行）
        let lineNum = 1;
        for (let i = 0; i < codeLines.length; i++) {
          if (rule.pattern.test(codeLines[i])) {
            lineNum = i + 1;
            break;
          }
        }
        violations.push({
          rule: rule.id,
          file: path.relative(ROOT, fullPath),
          line: lineNum,
          description: rule.description,
          detail: rule.detail,
          fix: rule.fix,
        });
        hasError = true;
      }
    }
  }
}

console.log('\n🔍 ZAX セキュリティスキャン開始...\n');
scanDir(SRC);

if (violations.length === 0) {
  console.log('✅ 問題なし。すべてのセキュリティチェックをパスしました。\n');
  process.exit(0);
} else {
  console.log(`❌ ${violations.length} 件のセキュリティ問題が見つかりました:\n`);
  for (const v of violations) {
    console.log(`  [${ v.rule }] ${ v.file }:${ v.line }`);
    console.log(`    問題: ${ v.description }`);
    console.log(`    詳細: ${ v.detail }`);
    console.log(`    修正: ${ v.fix }`);
    console.log();
  }
  process.exit(1);
}
