# ZAX 診断機能コード一覧

このフォルダは、ZAXの「診断（Diagnostic）」機能に関連するコードをまとめて確認するためのドキュメント集です。
**実際のコードは `src/` 配下にあります。このフォルダはあくまでも参照・閲覧用です。**

## ファイル構成

| ファイル名 | 対応する実際のパス | 役割 |
|---|---|---|
| `01_api_submit_route.md` | `src/app/api/diagnostic/submit/route.ts` | 診断送信APIルート（メイン処理） |
| `02_DiagnosticWizard.md` | `src/components/diagnostic/DiagnosticWizard.tsx` | 診断ウィザードUI |
| `03_DiagnosticResultClient.md` | `src/components/diagnostic/DiagnosticResultClient.tsx` | 診断結果表示UI |
| `04_ResultRadarChart.md` | `src/components/diagnostic/ResultRadarChart.tsx` | レーダーチャートコンポーネント |
| `05_gemini.md` | `src/lib/gemini.ts` | Gemini AI クライアント |
| `06_gemini_log.md` | `src/lib/gemini-log.ts` | Gemini ログ記録 |
| `07_crypto.md` | `src/lib/crypto.ts` | セッション署名・暗号化 |
| `08_db_client.md` | `src/lib/db/client.ts` | DB・ベクトルストアクライアント |

## データフロー

```
ユーザーが質問に回答
        ↓
DiagnosticWizard.tsx
（フロントエンド）
        ↓ POST /api/diagnostic/submit
submit/route.ts
（バックエンド）
  ├─ gemini.ts → Gemini 2.0-flash で性格分析テキスト生成
  ├─ gemini.ts → gemini-embedding-001 で768次元埋め込み生成
  ├─ db/client.ts → DiagnosticResult をDBに保存
  └─ db/client.ts → EssenceVector（ベクトル）をDBに保存
        ↓
DiagnosticResultClient.tsx
（結果ページ表示）
  └─ ResultRadarChart.tsx → 6次元レーダーチャート描画
```

## 修正履歴

- **2026-02-26**: `gemini.ts` のモデル名を `gemini-2.5-flash` → `gemini-2.0-flash` に修正
  - 「通信エラーが発生しました」の根本原因
