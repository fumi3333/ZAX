# ZAX 技術アーキテクチャ詳細

---

## 📐 システム全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                      クライアント層                           │
│  Next.js 16 SSR/SSG + React 19 Client Components             │
│  Tailwind CSS v4 | Framer Motion | recharts                  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│                   Next.js API Routes                          │
│  /api/diagnostic/submit                                       │
│  /api/match                                                   │
│  /api/analyze                                                 │
│  /api/feedback                                                │
└─────────┬──────────────────────┬────────────────────────────┘
          │                      │
┌─────────▼────────┐   ┌────────▼────────────────────────────┐
│   Gemini API     │   │  PostgreSQL 16 + pgvector 0.5.1     │
│  (Google Cloud)  │   │  ankane/pgvector Docker Image       │
│                  │   │                                      │
│ - gemini-pro     │   │ リレーショナルテーブル:             │
│ - text-emb-004   │   │  - users                            │
└──────────────────┘   │  - diagnostic_results               │
                       │  - interactions                      │
                       │  - feedbacks                         │
                       │                                      │
                       │ pgvector テーブル:                  │
                       │  - essence_vectors                   │
                       │    (vector(6) + HNSW index)          │
                       │                                      │
                       │ Prisma ORM 7.4.0                     │
                       └──────────────────────────────────────┘
```

---

## 🔧 技術スタック詳細

### フロントエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フレームワーク** | Next.js | 16.1.4 | App Router, SSR/SSG, API Routes |
| **UI ライブラリ** | React | 19.2.3 | コンポーネント設計 |
| **スタイリング** | Tailwind CSS | v4.1.18 | ユーティリティファースト |
| **アニメーション** | Framer Motion | 12.29.2 | スクロール連動、スタガー |
| **チャート** | recharts | 3.7.0 | レーダーチャート |
| **アイコン** | lucide-react | 0.562.0 | SVG アイコン |
| **型安全** | TypeScript | 5.x | 静的型チェック |

### バックエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **AI (生成)** | Gemini Pro | — | 性格分析レポート生成 |
| **AI (埋め込み)** | text-embedding-004 | — | 768次元ベクトル生成 |
| **AI SDK** | @google/generative-ai | 0.24.1 | Gemini API クライアント |
| **データベース** | PostgreSQL | 16 | リレーショナルデータ |
| **ベクトル検索** | pgvector | 0.5.1 | HNSW インデックス |
| **ORM** | Prisma | 7.4.0 | 型安全なクエリ |
| **認証** | bcryptjs | 3.0.3 | パスワードハッシュ化 |
| **暗号化** | Node.js crypto | — | AES-256-CBC |

### インフラ

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| **ホスティング** | Vercel | フロントエンド CI/CD |
| **DB (開発)** | Docker Compose | ローカル pgvector 環境 |
| **DB (本番候補)** | Supabase / Neon / Railway | pgvector 対応 PostgreSQL |

---

## 🗄️ データベース設計

### ER図（簡略版）

```
┌──────────┐          ┌─────────────────┐
│  User    │──────────│ DiagnosticResult│
│          │ 1     *  │                 │
│  id      │          │  answers (JSON) │
│  email   │          │  synthesis      │
│  password│          │  vector (JSON)  │
└────┬─────┘          └─────────────────┘
     │
     │ 1
     │
     │ *
┌────▼─────────────┐
│ EssenceVector    │
│                  │
│ vector(6) ───────┼─── HNSW Index
│ vectorJson       │    (コサイン距離)
│ reasoning        │
│ resonanceScore   │
└──────────────────┘

     │ 1
     │
     │ *
┌────▼─────────────┐
│ Interaction      │
│                  │
│ userAId          │
│ userBId          │
│ vectorA (JSON)   │
│ vectorB (JSON)   │
│ fulfillmentScore │
│ feedbackText     │
└──────────────────┘
```

### テーブル詳細

#### `users`

| カラム | 型 | 説明 |
|--------|---|------|
| id | UUID | Primary Key |
| email | VARCHAR(255) | ユニーク |
| password | VARCHAR | bcrypt ハッシュ |
| createdAt | TIMESTAMPTZ | 作成日時 |

#### `diagnostic_results`

| カラム | 型 | 説明 |
|--------|---|------|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → users |
| answers | TEXT (JSON) | `{1: 7, 2: 5, ...}` |
| synthesis | TEXT | Gemini生成の分析レポート |
| vector | TEXT (JSON) | 768次元ベクトル |
| createdAt | TIMESTAMPTZ | 診断実施日時 |

#### `essence_vectors`

| カラム | 型 | 説明 |
|--------|---|------|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → users |
| **vector** | **vector(6)** | **pgvector型（6次元）** |
| vectorJson | TEXT (JSON) | バックアップ用JSON表現 |
| reasoning | TEXT | ベクトル生成理由 |
| resonanceScore | FLOAT | 共鳴スコア（0-100） |
| createdAt | TIMESTAMPTZ | 作成日時 |

**インデックス**:
```sql
CREATE INDEX idx_essence_vectors_hnsw
ON essence_vectors
USING hnsw (vector vector_cosine_ops);
```

#### `interactions`

| カラム | 型 | 説明 |
|--------|---|------|
| id | UUID | Primary Key |
| userAId | UUID | ユーザーA |
| userBId | UUID | ユーザーB（マッチング相手） |
| vectorA | TEXT (JSON) | マッチング時のAのベクトル |
| vectorB | TEXT (JSON) | マッチング時のBのベクトル |
| fulfillmentScore | INT (1-10) | 充足感 |
| willMeetAgain | INT (1-10) | また会いたい |
| partnerSeemed | INT (1-10) | 相手は楽しそう |
| growthPotential | INT (1-10) | 成長できそう |
| feedbackText | TEXT | 自由記述 |
| createdAt | TIMESTAMPTZ | 対話日時 |

---

## 🧮 マッチングアルゴリズム詳細

### 1. ベクトル距離計算

```typescript
// コサイン類似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA === 0 || magB === 0 ? 0 : dot / (magA * magB);
}
```

**範囲**: -1（正反対） 〜 +1（完全一致）

### 2. 補完性スコア

```typescript
function calculateComplementarityScore(
  userVec: number[],
  targetVec: number[]
): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const optimalDistance = 0.5;
  const variance = 0.1;
  
  // ベルカーブ: 類似度0.5で最大値100
  return Math.exp(-Math.pow(sim - optimalDistance, 2) / variance) * 100;
}
```

**グラフ**:
```
スコア
 100|         ╱╲
    |        ╱  ╲
  80|       ╱    ╲
    |      ╱      ╲
  60|     ╱        ╲
    |    ╱          ╲
  40|   ╱            ╲
    |  ╱              ╲
  20| ╱                ╲
    |╱__________________╲___
  0 +----+----+----+----+----+→ 類似度
   -1   0   0.5   1.0
```

### 3. pgvector 検索クエリ

```sql
SELECT 
  ev.id,
  ev."userId",
  ev."vectorJson",
  ev.reasoning,
  ev."resonanceScore",
  (ev.vector <=> '[80,60,90,45,70,85]'::vector) as distance
FROM "essence_vectors" ev
ORDER BY distance ASC  -- コサイン距離で昇順
LIMIT 20;
```

**演算子**:
- `<=>` : コサイン距離（0 = 一致, 2 = 正反対）
- `<->` : L2距離（ユークリッド距離）
- `<#>` : 内積の負数

### 4. マッチングフロー

```typescript
async function findTopMatches(
  userVector: number[],
  topN: number = 5
): Promise<MatchResult[]> {
  
  // 1. DB検索（実DB接続時）
  const dbCandidates = await vectorStore.searchSimilar(userVector, 20);
  
  // 2. 各候補のスコア計算
  const results = dbCandidates.map(candidate => {
    const sim = cosineSimilarity(userVector, candidate.vector);
    const growthScore = calculateComplementarityScore(userVector, candidate.vector);
    
    return {
      matchUser: candidate,
      similarity: sim,
      growthScore: Math.round(growthScore),
      reasoning: generateReasoning(userVector, candidate.vector, sim),
    };
  });
  
  // 3. 補完性スコアでソート
  return results
    .sort((a, b) => b.growthScore - a.growthScore)
    .slice(0, topN);
}
```

---

## 🤖 AI パイプライン

### 診断分析フロー

```
ユーザー回答 (50問)
  ↓
カテゴリ別集計 (6カテゴリ × 平均値)
  ↓
プロンプト構築
  ↓
┌──────────────────────────────┐
│ Gemini Pro API Call          │
│ model.generateContent()      │
└──────┬───────────────────────┘
       │ JSON Response
       ↓
{
  "synthesis": "あなたは論理性と...",
  "categoryScores": {...}
}
  ↓
┌──────────────────────────────┐
│ text-embedding-004 API Call  │
│ embeddingModel.embedContent()│
└──────┬───────────────────────┘
       │ 768-dim vector
       ↓
[0.123, -0.456, 0.789, ...]
  ↓
PostgreSQL に保存
```

### プロンプト例（抜粋）

```typescript
const prompt = `
以下の性格診断（1-7尺度）の回答に基づき、
この人物の性格、価値観、行動特性を詳細に分析し、
日本語で記述してください。

## カテゴリ別スコア傾向
- 論理性: 平均 6.2/7.0
- 直感力: 平均 4.8/7.0
- 共感性: 平均 5.5/7.0
...

指示: 
この人物の強み、弱み、コミュニケーションスタイル、
適した環境について、プロの心理分析官として
レポートを作成してください。
`;
```

---

## 🔐 セキュリティ

### 認証

- **パスワードハッシュ化**: bcryptjs（salt rounds: 10）
- **セッション**: HttpOnly Cookies
- **暗号化**: AES-256-CBC（環境変数: `ENCRYPTION_KEY`）

### データ保護

- **Prisma ORM**: SQLインジェクション対策
- **環境変数**: `.env.local`（Git除外）
- **API Rate Limiting**: （将来実装予定）

---

## 🚀 デプロイ構成

### 開発環境

```bash
# 1. PostgreSQL + pgvector 起動
docker-compose up -d

# 2. Prisma生成
npx prisma generate

# 3. マイグレーション
npx prisma migrate dev

# 4. 開発サーバー
npm run dev
```

### 本番環境（Vercel + Supabase例）

```
Vercel
  ├── フロントエンド（SSR/SSG）
  ├── API Routes（サーバーレス関数）
  └── 環境変数:
      - GOOGLE_API_KEY
      - DATABASE_URL (Supabase接続文字列)
      - ENCRYPTION_KEY

Supabase
  └── PostgreSQL + pgvector
      - 自動バックアップ
      - Connection Pooling
```

---

## 📊 パフォーマンス

### ベンチマーク（想定）

| 操作 | 時間 | 備考 |
|------|------|------|
| 診断送信 → AI分析 | 15-20秒 | Gemini API 2回呼び出し |
| pgvector検索（1万件） | < 50ms | HNSW index使用時 |
| マッチング結果表示 | < 1秒 | API → フロント描画 |

### スケーラビリティ

- **ユーザー数**: 10万人まで単一DBで対応可能
- **ベクトル数**: HNSW indexにより100万件でも高速検索
- **API制限**: Gemini Pro（60 requests/min）

---

## 🔧 開発ツール

- **Cursor**: AI支援エディタ
- **Docker Desktop**: ローカルDB環境
- **Prisma Studio**: DB GUI（`npx prisma studio`）
- **Vercel CLI**: デプロイテスト

---

## 📚 技術的負債・今後の課題

1. **ベクトル次元の不整合**: 768次元（embedding）vs 6次元（マッチング）
2. **RAG未実装**: 設計のみ、コードなし
3. **TimescaleDB未使用**: スキーマにあるが活用していない
4. **認証の簡易化**: bcrypt + Cookie（JWT への移行検討）
5. **エラーハンドリング**: モックフォールバックのみ

---

次のドキュメント: [実装ガイド](./IMPLEMENTATION.md)
