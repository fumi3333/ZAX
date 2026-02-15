# ZAX コード概要

価値観ベースのマッチングプラットフォーム。診断→結果→チャット→振り返りの一連のフローを提供。

---

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # トップ（LandingPage）
│   ├── layout.tsx          # 共通レイアウト + CorporateHeader
│   ├── globals.css
│   ├── diagnostic/         # 50問診断
│   │   ├── page.tsx
│   │   └── result/[id]/    # 結果表示
│   ├── chat/               # ブラインドチャット・振り返り
│   │   ├── page.tsx
│   │   └── ChatClient.tsx
│   ├── input/              # エッセンス入力（EssenceInput）
│   ├── api/                # API Routes
│   ├── about/              # 企業紹介
│   ├── philosophy/         # 哲学・理念
│   ├── product/            # プロダクト説明
│   └── technology/         # 技術アーキテクチャ
├── components/
│   ├── CorporateHeader.tsx
│   ├── LandingPage.tsx
│   ├── BlindChat.tsx       # チャットUI
│   ├── diagnostic/         # 診断関連
│   │   ├── DiagnosticWizard.tsx   # 50問ウィザード
│   │   ├── DiagnosticResultClient.tsx
│   │   ├── ResultRadarChart.tsx
│   │   ├── MatchResults.tsx       # マッチング候補表示
│   │   └── CompareRadarChart.tsx
│   ├── chat/
│   │   ├── PostChatInterview.tsx  # 振り返りフォーム
│   │   └── ReflectionView.tsx     # 変化サマリー表示
│   ├── EssenceInput.tsx    # 入力ウィザード
│   ├── VectorTransformationVisual.tsx
│   └── ui/                 # 共通UI (button, card)
├── lib/
│   ├── db/client.ts        # Prisma + pgvector
│   ├── gemini.ts           # Gemini API（分析・埋め込み・振り返り）
│   ├── rec/engine.ts       # マッチングロジック
│   ├── crypto.ts
│   ├── auth-check.ts
│   └── actions/manual-auth.ts
├── data/
│   ├── questions.ts        # 50問（5カテゴリ）
│   └── happiness2019.ts
└── middleware.ts           # セッション付与
```

---

## 主要フロー

### 1. 診断フロー

1. `/diagnostic` → `DiagnosticWizard` で50問回答
2. `POST /api/diagnostic/submit` に送信
3. カテゴリスコア（5軸）→ 6次元ベクトルにマッピング
4. Gemini で心理分析レポート生成
5. `DiagnosticResult` と `essence_vectors` に保存
6. `/diagnostic/result/[id]` で結果表示

**6次元**: 論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性  
**5カテゴリ→6次元マッピング**:  
誠実性→論理性・意志力 / 開放性→直感力・創造性 / 協調性→共感性 / 情緒・外向→柔軟性  

**心理測定**: `questions.ts` に `reverse: true` を付与した逆転項目あり（黙従バイアス対策）。集計時は `effectiveScore` で反転処理。

### 2. マッチング

- `MatchResults` が `POST /api/match` を呼び出し
- `findTopMatches`（engine.ts）: pgvector 検索 or 50人アーキタイプフォールバック
- コサイン類似度 + **補完性スコア**（類似度が `optimalSimilarity` に近いほど高得点）でランキング
- `optimalSimilarity`（デフォルト 0.5）は `POST /api/match` の body で指定可能（恋愛: 0.4、ビジネス: 0.5、深い共感: 0.6 など）
- Gemini で相性理由を生成

### 3. チャット→振り返り

1. `/chat?partner=xxx` → `BlindChat`
2. チャット終了 → `PostChatInterview`（相手について・どう変わった・成長・一緒にいてどうだった）
3. `POST /api/reflection` → Gemini で「あなたの変化」サマリー
4. `ReflectionView` で表示

---

## API 一覧

| エンドポイント | 用途 |
|---------------|------|
| POST /api/diagnostic/submit | 診断回答送信・分析・保存 |
| GET /api/diagnostic/result/[id] | 結果取得 |
| POST /api/match | マッチング候補検索 |
| POST /api/reflection | 振り返りサマリー生成 |
| POST /api/analyze | エッセンス分析（/input 用） |
| POST /api/feedback | フィードバック保存（Evolutionary Loop 用） |

---

## ベクトルアーキテクチャ（6次元 vs 768次元）

| 種類 | 次元 | 用途 | 保存先 |
|------|------|------|--------|
| **表示用ベクトル (V_display)** | 6 | レーダーチャート表示・マッチング検索 | `essence_vectors.vector`, `DiagnosticResult.vector` |
| **埋め込みベクトル (V_essence)** | 768 | Gemini text-embedding-004 の意味空間 | 現状は未保存（将来の拡張用） |

- **診断フロー**: 50問のルールベース集計 → 6次元ベクトルのみ生成・保存
- **EssenceInput フロー**: LLM が6次元を推定 + `embedContent` で768次元を生成するが、DBには6次元のみ保存
- **マッチング**: pgvector の `<=>` (距離) は6次元ベクトルで計算。768次元は同一意味空間での比較に使う設計だが、現行では未採用
- **バリデーション**: `vectorStore.saveEmbedding` / `searchSimilar` は次元数6を厳密に検証

---

## データモデル（Prisma）

- **User**: 認証（メール・パスワード）
- **DiagnosticResult**: 診断回答・synthesis・6次元ベクトル
- **EssenceVector**: pgvector(6) でマッチング検索用（6次元のみ。768次元埋め込みは非保存）
- **Feedback**: 対話後の変化記録
- **Interaction**: マッチペアのフィードバック（将来的な連携用）

---

## 環境変数

| 変数 | 説明 |
|------|------|
| DATABASE_URL | PostgreSQL（pgvector 拡張必須） |
| GOOGLE_API_KEY | Gemini API 用 |

---

## デプロイ

- **Vercel**: `vercel.json` でビルド時 DATABASE_URL 設定
- **Cloud Run**: `Dockerfile` + `docs/DEPLOY_CLOUD_RUN.md` 参照
