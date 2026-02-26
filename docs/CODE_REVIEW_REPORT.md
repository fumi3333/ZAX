# ZAX コード全体確認レポート

> 全ソースコードの動作・整合性・潜在課題の確認結果

---

## 1. 構成概要

| カテゴリ | ファイル数 | 状態 |
|----------|-----------|------|
| API Routes | 9 | 稼働 |
| コンポーネント | 20+ | 稼働 |
| lib（核心ロジック） | 7 | 稼働 |
| データ | 2 | 整合 |

---

## 2. 確認済み・問題なし

### 2.1 セキュリティ（Geminiレビュー対応済）

- **`src/lib/db/client.ts`**: 本番でDB未設定時は throw、ビルド時は除外
- **`src/lib/crypto.ts`**: デフォルトキー削除、`ENCRYPTION_KEY` 必須（ランタイム）
- **`src/lib/actions/manual-auth.ts`**: bcrypt、ドメイン制限（武蔵野大学）

### 2.2 コアフロー

- **診断 → 結果 → マッチング → チャット → 振り返り** の一連フローは実装済み
- **Prisma schema**: User, Reflection, GeminiLog, EssenceVector, DiagnosticResult, Feedback, Interaction が定義
- **マッチングエンジン**: コサイン類似度 + 補完性スコア、50アーキタイプのフォールバック

### 2.3 API の防御的実装

- `reflection`, `mypage`, `gemini-logs` は `p?.reflection`, `p?.geminiLog` でモック未実装時もエラーにならない
- 各APIで `try-catch` と適切な HTTP ステータスコード

### 2.4 リッカート尺度

- `PostChatInterview`: 4問を1〜7のリッカート尺度で実装
- `ReflectionView`: 数値 → ラベル表示の変換が実装済み

---

## 3. 要修正・改善点

### 3.1 モック Prisma の不足モデル

**現状**: モックには `user`, `diagnosticResult`, `essenceVector` のみ実装されている。

**影響**:
- `/api/mypage`: `diagnosticResult.findMany` がモックに存在しない → モック時は型エラーやランタイムエラーの可能性
- `/api/feedback`: `prisma.feedback` 未定義 → `try-catch` で握りつぶし、保存されないがクラッシュはしない
- `reflection`, `geminiLog`: `p?.reflection` 等でガード済みのため、未実装時は空配列/スキップで動作

**推奨**: 開発時の動作確認のため、モックに `reflection`, `geminiLog`, `feedback` の最小実装を追加する。

---

### 3.2 暗号化した reasoning の表示

**現状**:
- `/api/analyze` は reasoning を暗号化して `vectorStore.saveEmbedding` に渡している
- マッチング結果の `candidate.reasoning` をそのまま `bio` として表示している
- `decrypt` はどこからも呼ばれていない

**影響**: EssenceInput 経由で保存されたベクトルがマッチ結果に出ると、`bio` が暗号文のまま表示される。

**推奨**:
- マッチ結果表示用には復号する、または
- 表示用途の reasoning は暗号化せず、別カラムで機密情報のみ暗号化する設計に分離する

---

### 3.3 非推奨 API の利用

**場所**: `src/lib/crypto.ts`

```ts
// 現在
const key = crypto.createHash('sha256').update(...).digest('base64').substr(0, 32);

// 推奨
const key = crypto.createHash('sha256').update(...).digest('base64').slice(0, 32);
```

`String.prototype.substr` は非推奨のため、`slice` または `substring` への置き換えを推奨。

---

### 3.4 チャットのモック実装

**現状**: `BlindChat.tsx` は `setTimeout` による擬似応答のみで、リアルタイム通信なし。

**影響**: Gemini レビュー指摘の通り、本番運用時は WebSocket 等のリアルタイム基盤が必要。

**対応**: 現状のままでも MVP としては妥当。利用状況を見てから基盤移行を検討。

---

### 3.5 `requireAuth` のチェック内容

**現状**: `auth-check.ts` は `zax-session` Cookie の存在のみ確認し、DB上のユーザー存在は未検証。

**影響**: 不正なセッションIDでも通過する可能性はあるが、データ取得時は存在しないIDであれば空になる程度で、現状のMVPでは許容範囲。

---

## 4. ファイル別サマリー

| ファイル | 役割 | 状態 |
|----------|------|------|
| `src/lib/db/client.ts` | Prisma + pgvector / モック | 本番チェック・モック分岐OK |
| `src/lib/crypto.ts` | AES-256 暗号化 | substr を slice に変更推奨 |
| `src/lib/gemini.ts` | 分析・要約・埋め込み | APIキー未設定時のフォールバックあり |
| `src/lib/gemini-log.ts` | Gemini ログ保存 | `geminiLog` 未実装時はスキップ |
| `src/lib/rec/engine.ts` | マッチング | DB + アーキタイプフォールバック |
| `src/app/api/diagnostic/submit/route.ts` | 診断送信 | ゲストユーザー作成、Cookie 更新 |
| `src/app/api/reflection/route.ts` | 振り返り保存 | 数値・テキスト両対応 |
| `src/app/api/mypage/route.ts` | 診断・振り返り一覧 | reflection 未実装時のガードあり |
| `src/app/api/feedback/route.ts` | フィードバック | モック時は保存エラーを握りつぶし |
| `src/app/api/analyze/route.ts` | EssenceInput 分析 | 暗号化保存（表示側の復号なし） |
| `src/middleware.ts` | セッション付与 | UUID 発行 |
| `src/lib/actions/manual-auth.ts` | ログイン・登録 | ドメイン制限あり |

---

## 5. まとめ

- **本番デプロイに必要な環境変数**: `DATABASE_URL`, `GOOGLE_API_KEY`, `ENCRYPTION_KEY`
- **ビルド**: `npm run build` は成功確認済み
- **優先対応**: 暗号化 reasoning の表示不整合、`substr` の置き換え
- **中長期対応**: モック Prisma の拡充、チャットのリアルタイム化
