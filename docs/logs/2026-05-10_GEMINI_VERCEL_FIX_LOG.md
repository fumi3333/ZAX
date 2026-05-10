# ZAX Gemini API & Vercel 本番環境トラブルシューティングログ
作成日時: 2026年5月10日

本ドキュメントは、ZAXのVercel本番環境において発生していた「AI診断レポート生成エラー」の調査プロセス、原因究明、および実装した対策について、今後の開発で同様の問題が起きた際の手がかりとするために記録したものです。

---

## 1. 発生していた問題
*   **症状**: ユーザーが診断を終えてメールアドレスを入力した後、または「レポートを再生成する」ボタンをクリックした際に、画面に「分析エラーが発生しました。時間を置いて再試行してください。」というエラーメッセージが継続して表示される。
*   **エラー発生箇所**: `/api/diagnostic/generate-report` へのAPIリクエスト。
*   **サーバー側エラーログ**:
    ```text
    [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent: [400 Bad Request] API Key not found. Please pass a valid API key.
    ```

---

## 2. 原因究明

### 原因 ①: Vercel本番環境での環境変数（`GOOGLE_API_KEY`）未設定
調査の結果、開発者のローカル環境（`.env.production`）にはAPIキーが正しく定義されていたものの、**Vercelダッシュボードのプロジェクト設定（Environment Variables）に `GOOGLE_API_KEY` が登録されていない**状態でした。そのため、本番サーバー上では常に空文字列（`""`）でGemini APIにアクセスしていました。

### 原因 ②: Next.jsのビルド時キャッシュ（静的評価）問題
Next.jsのサーバーサイドモジュールである `src/lib/gemini.ts` で、以下のようにトップレベル（モジュールのロード時）で `process.env.GOOGLE_API_KEY` を変数に格納していました。
```typescript
const API_KEY = process.env.GOOGLE_API_KEY || "";
export const genAI = new GoogleGenerativeAI(API_KEY);
```
これにより、Vercelがアプリをビルド（コンパイル）するタイミングで `GOOGLE_API_KEY` が空だった場合、**空のAPIキーを持ったクライアントインスタンスが固定キャッシュ（静的最適化）** されてしまい、後からダッシュボード上で環境変数を追加しても、アプリが再起動または再ビルドされるまで空文字を使い続けてしまうというNext.js特有のライフサイクルの罠に陥っていました。

### 原因 ③: コード内の古い変数参照によるビルド失敗
上記を解決するために `src/lib/gemini.ts` からトップレベルの `const API_KEY` 定数を削除して動的なGetterに移行した際、ファイルの下部にある別の機能（`generateMatchReasoning`, `calculateDeltaVector`, `generateReflectionSummary`）で `API_KEY` という名前の古い参照が残っていました。
このため、Vercel側で以下のコンパイルエラー（TypeError）が起き、最新コードのデプロイ（ビルド）が失敗し、本番環境が古い状態（バグのある状態）で固定されていました。
```text
Type error: Cannot find name 'API_KEY'.
Error: Command "npm run build" exited with 1
```

---

## 3. 実装した解決策

### 解決策 ①: Gemini呼び出しの遅延評価（Proxyパターンの導入）
ビルド時ではなく、**実際にAPIがコールされた瞬間（実行時・ランタイム）に環境変数を動的に読み込む**ように、ES6の `Proxy` と `Getter` 関数を用いて `src/lib/gemini.ts` をリファクタリングしました。
これにより、Next.jsの強力なビルド最適化を回避し、常にVercelの最新の環境変数からAPIキーを取得できるようになりました。

```typescript
// 実行時にAPIキーを取得するためのGetter関数を用意（ビルド時の空文字キャッシュを回避）
export const getGenAI = () => new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
export const getModel = () => getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
export const getEmbeddingModel = () => getGenAI().getGenerativeModel({ model: "text-embedding-004" });

// 下位互換性のためにプロキシオブジェクトとしてエクスポート（既存コードの修正を最小限に抑える）
export const genAI = new Proxy({}, { get: (t, p) => (getGenAI() as any)[p] }) as GoogleGenerativeAI;
export const model = new Proxy({}, { get: (t, p) => (getModel() as any)[p] }) as ReturnType<typeof getModel>;
export const embeddingModel = new Proxy({}, { get: (t, p) => (getEmbeddingModel() as any)[p] }) as ReturnType<typeof getEmbeddingModel>;
```

### 解決策 ②: すべてのコンパイルエラーの修正
`gemini.ts` 内に残っていたすべての `API_KEY` 定数の参照箇所を `process.env.GOOGLE_API_KEY` に変更し、TypeScriptのビルドが完全に成功するように修正しました。これにより、VercelのCI/CDパイプラインが無事通過（Ready）するようになりました。

### 解決策 ③: 本番データベースのクリーンアップ
APIキーエラーの間に作られてしまった、診断結果が空（エラー文言のみ）の無効なデータベースレコード（計13件）を本番PostgreSQLデータベースから綺麗に抹消し、データの健全性を保ちました。

### 解決策 ④: マッチングAPI（`/api/matching/candidates`）の完全実装
未完成だった裏側のマッチング検索APIを、pgvectorによるコサイン類似度を用いた上位3名の推薦ロジックにアップデートし、完全にデプロイしました。

---

## 4. 今後の開発に向けた教訓
1.  **Vercel環境変数は即座に反映されない**: 環境変数を追加・更新した場合は、必ずダッシュボードから **Redeploy（再デプロイ）** を行う。
2.  **サーバーサイドモジュールのトップレベルでの `process.env` 代入を避ける**: モジュールがインポートされた瞬間に値が固定されるため、APIキーやシークレット情報などは常にメソッド内、あるいは動的なGetterを介して「必要な瞬間」に評価するように設計する。
3.  **Vercelのビルドエラー通知を常に監視する**: デプロイ時に「TypeScriptエラー」などでビルドがコケていると、ユーザーのブラウザには「直前にビルドが成功した古い壊れたバージョン」が表示され続け、本番のバグ修正が反映されない。
