# ZAX — 価値観ベース・マッチングOS

> 表面的な属性ではなく「本質」でつながる、動的マッチングプラットフォーム

**Live**: [https://zax.fumiproject.dev](https://zax.fumiproject.dev)

> **📋 コードレビュー・構成確認**  
> - **全コード一覧**: [ZAX_FULL_CODE.md](./ZAX_FULL_CODE.md) — ソースコードを1ファイルにまとめたもの（Gemini等向け）  
> - **構成・フロー**: [CODE_SUMMARY.md](./CODE_SUMMARY.md) — ディレクトリ構成・API一覧

---

## 概要

ZAX は、ユーザーの内面的特性（価値観・思考パターン・行動傾向）を多次元ベクトルとして捉え、  
ベクトル空間上の距離計算によって「本質的に共鳴する相手」を見つけ出すマッチングシステムです。

従来のマッチングアプリが年齢・年収・見た目で篩い分けるのに対し、  
ZAX は **50問の性格・価値観診断** → **Gemini AI による分析** → **pgvector による類似検索** で、  
ユーザー自身も気づいていない「思考の波長が合う相手」を発見します。

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                    フロントエンド                       │
│         Next.js 16 (App Router) + Tailwind CSS        │
│         Framer Motion (アニメーション)                  │
└───────────────┬─────────────────────┬───────────────┘
                │                     │
       API Routes (Next.js)    Static Pages
                │
┌───────────────▼─────────────────────────────────────┐
│                   バックエンド                         │
│                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │ Gemini Pro │  │ Embedding  │  │  マッチング     │ │
│  │ (分析生成)  │  │ text-emb-  │  │  エンジン       │ │
│  │            │  │ edding-004 │  │ (コサイン類似度 │ │
│  │            │  │ (ベクトル化)│  │  + 補完性計算)  │ │
│  └────────────┘  └─────┬──────┘  └───────┬────────┘ │
│                        │                  │           │
│                 ┌──────▼──────────────────▼────────┐ │
│                 │     PostgreSQL + pgvector         │ │
│                 │   (ベクトル保存 & HNSW検索)       │ │
│                 │   Prisma ORM                      │ │
│                 └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フレームワーク** | Next.js | 16.1.4 | App Router, SSR/SSG, API Routes |
| **UI** | React | 19.2 | コンポーネント設計 |
| **スタイル** | Tailwind CSS | v4 | ユーティリティファースト CSS |
| **アニメーション** | Framer Motion | 12.x | スクロール連動アニメーション |
| **AI (生成)** | Google Gemini Pro | — | 性格分析テキスト生成 |
| **AI (埋め込み)** | text-embedding-004 | — | テキスト → 768次元ベクトル変換 |
| **DB** | PostgreSQL | 16 | リレーショナルデータ |
| **ベクトル検索** | pgvector | 0.5.1 | HNSW インデックスによる高速類似検索 |
| **ORM** | Prisma | 7.x | 型安全なDB操作 |
| **認証** | bcryptjs + Cookie | — | セッション管理 |
| **暗号化** | AES-256-CBC | — | 機密データ暗号化 |
| **デプロイ** | Vercel | — | フロントエンド CI/CD |
| **DB ホスティング** | Docker (ankane/pgvector) | — | ローカル/VPS |

---

## プロジェクト構成

```
ZAX/
├── prisma/
│   └── schema.prisma          # Prismaスキーマ (pgvector拡張含む)
├── db/
│   └── schema.sql             # 手動SQL (HNSW インデックス定義)
├── docker-compose.yml         # pgvector付きPostgreSQL
├── src/
│   ├── app/
│   │   ├── page.tsx           # トップページ (LandingPage)
│   │   ├── layout.tsx         # 共通レイアウト (CorporateHeader)
│   │   ├── globals.css        # グローバルCSS (Tailwind v4)
│   │   ├── diagnostic/
│   │   │   ├── page.tsx       # 50問 性格・価値観診断
│   │   │   └── result/[id]/
│   │   │       └── page.tsx   # 診断結果表示 (レーダーチャート)
│   │   ├── api/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts   # Gemini分析 API
│   │   │   ├── diagnostic/
│   │   │   │   └── submit/
│   │   │   │       └── route.ts # 診断送信 → AI分析 → ベクトル保存
│   │   │   └── match/
│   │   │       └── route.ts   # マッチング API (ベクトル類似検索)
│   │   ├── about/             # 企業情報ページ
│   │   ├── philosophy/        # ビジョンページ
│   │   ├── technology/        # プロダクトアーキテクチャ解説
│   │   ├── login/             # ログイン
│   │   ├── register/          # ユーザー登録
│   │   └── feedback/          # フィードバック
│   ├── components/
│   │   ├── CorporateHeader.tsx # 固定ヘッダー (グラスモルフィズム)
│   │   ├── LandingPage.tsx    # ランディングページ
│   │   ├── diagnostic/
│   │   │   └── DiagnosticWizard.tsx  # 診断UI (7段階バブル選択)
│   │   └── ui/                # shadcn/ui コンポーネント
│   ├── lib/
│   │   ├── gemini.ts          # Gemini API クライアント & 分析関数
│   │   ├── crypto.ts          # AES-256 暗号化/復号
│   │   ├── db/
│   │   │   └── client.ts      # Prisma + pgvector クライアント
│   │   └── rec/
│   │       └── engine.ts      # マッチングエンジン (コサイン類似度 + 補完性)
│   └── data/
│       └── questions.ts       # 診断50問 (カテゴリ付き)
├── .env                       # 環境変数
├── .env.local                 # ローカル環境変数
└── package.json
```

---

## コア機能

### 1. 性格・価値観診断 (50問)

`/diagnostic` で実施。7段階バブルUIで直感的に回答。

- **質問カテゴリ**: 論理性、直感力、共感性、意志力、創造性、柔軟性
- **回答形式**: 1 (同意しない) 〜 7 (同意する) の7段階
- **自動進行**: 回答選択で次の質問に自動遷移
- **プログレスバー**: 回答済み割合をリアルタイム表示

### 2. AI 分析パイプライン

診断完了後、`/api/diagnostic/submit` で以下を実行:

```
回答データ (50問)
    ↓
カテゴリ別スコア集計
    ↓
Gemini Pro に分析プロンプト送信
    ↓
性格分析レポート (テキスト) 生成
    ↓
text-embedding-004 で 768次元ベクトル化
    ↓
PostgreSQL + pgvector に保存
    ↓
結果ページにリダイレクト
```

### 3. ベクトルマッチング

`/api/match` エンドポイント:

- **pgvector HNSW 検索**: `<=>` (コサイン距離) 演算子で高速類似検索
- **補完性スコア**: 完全一致 (エコーチェンバー) を避け、**類似度 0.3〜0.6** の「成長を促す相手」を優先
- **フォールバック**: DB にユーザーが少ない場合、5つのアーキタイプ (Logic Sentinel, Chaos Weaver 等) と比較

**補完性スコアの計算式:**

```
Growth Potential = exp(-(similarity - 0.5)² / 0.1) × 100
```

類似度 0.5 付近で最大スコアとなるベルカーブ。似すぎず・違いすぎない相手を高評価。

### 4. 6次元エッセンスベクトル

ユーザーの「本質」を以下の6軸で表現:

| 次元 | 英名 | 説明 |
|------|------|------|
| 論理性 | Logic | 構造的・分析的思考 |
| 直感力 | Intuition | パターン認識・洞察力 |
| 共感性 | Empathy | 感情的共鳴・他者理解 |
| 意志力 | Determination | 推進力・目標達成 |
| 創造性 | Creativity | 発想力・芸術性 |
| 柔軟性 | Flexibility | 適応力・オープンマインド |

---

## データベース設計

### Prisma スキーマ

```prisma
// pgvector 拡張有効
datasource db {
  provider   = "postgresql"
  extensions = [vector]
}

model EssenceVector {
  vector     Unsupported("vector(6)")  // 6次元ベクトル (pgvector型)
  vectorJson String                     // JSON表現バックアップ
  reasoning  String                     // AI分析理由
}

model DiagnosticResult {
  answers   String  // 50問の回答 (JSON)
  synthesis String  // Gemini生成の分析レポート
  vector    String  // 768次元ベクトル (JSON)
}
```

### pgvector インデックス

```sql
-- HNSW インデックスによるコサイン類似度検索の高速化
CREATE INDEX idx_current_embeddings_hnsw
ON user_embeddings USING hnsw (embedding vector_cosine_ops)
WHERE valid_to IS NULL;  -- アクティブレコードのみ
```

---

## セットアップ手順

### 前提条件

- **Node.js** 18 以上
- **Docker Desktop** (pgvector 用)
- **Google API Key** (Gemini)

### 1. リポジトリクローン

```bash
git clone https://github.com/fumi3333/ZAX.git
cd ZAX
npm install
```

### 2. 環境変数の設定

`.env.local` を作成:

```env
# Gemini AI
GOOGLE_API_KEY=your_google_api_key_here

# PostgreSQL (Docker)
DATABASE_URL=postgresql://user:password@localhost:5432/zax?schema=public

# 暗号化キー (32文字)
ENCRYPTION_KEY=your_32_character_encryption_key!
```

### 3. PostgreSQL + pgvector 起動

```bash
docker-compose up -d
```

Docker Compose で `ankane/pgvector:v0.5.1` イメージが起動します。

| 項目 | 値 |
|------|-----|
| ホスト | localhost:5432 |
| ユーザー | user |
| パスワード | password |
| データベース | zax |

### 4. データベースマイグレーション

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス可能。

### ワンコマンドセットアップ (Windows)

```powershell
.\setup_zax.ps1
```

Docker起動 → DB マイグレーション → アプリ起動を自動実行します。

---

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/api/diagnostic/submit` | 診断回答を送信 → AI分析 → ベクトル保存 |
| `POST` | `/api/match` | ユーザーベクトルで類似検索 → マッチング結果返却 |
| `POST` | `/api/analyze` | テキスト入力 → 6次元ベクトル + 分析レポート生成 |
| `POST` | `/api/feedback` | フィードバック → ベクトル差分計算 (成長追跡) |

### POST `/api/diagnostic/submit`

**リクエスト:**
```json
{
  "answers": {
    "1": 5,
    "2": 3,
    "3": 7
  }
}
```

**レスポンス:**
```json
{
  "success": true,
  "id": "uuid-of-diagnostic-result",
  "synthesis": "あなたは論理性と共感性のバランスが..."
}
```

### POST `/api/match`

**リクエスト:**
```json
{
  "vector": [80, 60, 90, 45, 70, 85]
}
```

**レスポンス:**
```json
{
  "success": true,
  "match": {
    "matchUser": { "id": "...", "name": "Empathy Resonator", "vector": [...] },
    "similarity": 0.72,
    "growthScore": 85,
    "reasoning": "Delta Analysis: ..."
  }
}
```

---

## デプロイ

### Cloud Run (Google Cloud) - ハッカソン用

```bash
gcloud run deploy zax --source . --region asia-northeast1 --allow-unauthenticated
```

詳細は [docs/DEPLOY_CLOUD_RUN.md](docs/DEPLOY_CLOUD_RUN.md) を参照。

### Vercel (フロントエンド)

GitHub の `main` ブランチに push すると自動デプロイ。

```bash
git push origin main
```

**Vercel 環境変数** (ダッシュボードで設定):
- `GOOGLE_API_KEY`
- `DATABASE_URL` (本番DB接続文字列)
- `ENCRYPTION_KEY`

### データベース (本番)

本番環境では以下のいずれかを推奨:

| サービス | pgvector対応 | 特徴 |
|---------|-------------|------|
| **Supabase** | ネイティブ | 無料枠あり、Prisma互換 |
| **Neon** | ネイティブ | サーバーレス PostgreSQL |
| **Railway** | 拡張可 | Docker対応、簡単デプロイ |
| **自前VPS** | Docker | `ankane/pgvector` イメージ使用 |

---

## 今後のロードマップ

- [ ] 診断完了 → マッチング結果表示 UI の実装
- [ ] RAG パイプライン (過去の思考との対話)
- [ ] ベクトル差分によるリアルタイム成長追跡
- [ ] TimescaleDB による時系列ベクトル変化分析
- [ ] RLHF (人間のフィードバックによる強化学習) の統合
- [ ] 音声分析による非言語データの取り込み

---

## ライセンス

Private Repository — All Rights Reserved.
