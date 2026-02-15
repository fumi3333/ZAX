# ZAX 技術仕様書（完全版）

**Version**: Phase 1.0  
**Last Updated**: 2026-02-15  
**Status**: Production Ready (Demo)

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [哲学とビジョン](#2-哲学とビジョン)
3. [技術アーキテクチャ](#3-技術アーキテクチャ)
4. [データモデル](#4-データモデル)
5. [アルゴリズム](#5-アルゴリズム)
6. [API仕様](#6-api仕様)
7. [UI/UX設計](#7-uiux設計)
8. [セキュリティ](#8-セキュリティ)
9. [パフォーマンス](#9-パフォーマンス)
10. [デプロイ](#10-デプロイ)
11. [将来拡張](#11-将来拡張)

---

## 1. プロジェクト概要

### 1.1 ミッション

**「長期的幸福を最大化する、個人と集団の相互学習システム」**

### 1.2 コアバリュー

1. **本質主義**: 属性ではなく価値観で判断
2. **成長志向**: エコーチェンバーを避け、成長を促す
3. **時系列思考**: 人は変化する存在として扱う
4. **データドリブン**: フィードバックから継続的に学習

### 1.3 ターゲット

- **プライマリ**: 20-30代、自己理解に関心がある層
- **セカンダリ**: 大学生（ musashino-u.ac.jp ドメイン）
- **将来**: 企業のチームビルディング、心理カウンセリング支援

---

## 2. 哲学とビジョン

### 2.1 人間観

**前提**: 人間は固定された属性の集合ではなく、多次元空間上を移動し続ける存在

```
従来のモデル:
人間 = { 年齢: 25, 職業: "エンジニア", 趣味: "旅行" }
→ 静的、変化しない

ZAXのモデル:
人間 = Vector(t) where t = time
→ 動的、経験や出会いで変化
```

### 2.2 幸福の定義

```python
happiness(t) = f(
    subjective_wellbeing(t),      # 主観的満足度
    growth_trajectory(t),         # 成長曲線の角度
    meaningful_connections(t),    # 深い繋がりの数
    self_efficacy(t)              # 自己効力感
)
```

**測定方法**: マッチング後のフィードバック（4つの質問）

### 2.3 補完性の原理

**仮説**: 最適な相手は「似ている」ではなく「補完的」

```
類似度 1.0: エコーチェンバー
→ 自分の考えが肯定されるだけ
→ 新しい視点が得られない
→ 成長が停滞
→ 長期的に幸福度低下

類似度 0.5: 補完的関係
→ 共感できる部分がある
→ 同時に新しい刺激もある
→ 視野が広がる
→ 成長実感 → 幸福度上昇
```

---

## 3. 技術アーキテクチャ

### 3.1 システム全体図（詳細版）

```
┌──────────────────────────────────────────────────────────┐
│                       ユーザー                             │
│                  Browser (Chrome, Safari)                 │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────┐
│                     Vercel Edge                           │
│               Next.js 16 (SSR/SSG)                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Pages (Server Components)                        │    │
│  │  - / (Landing)                                   │    │
│  │  - /diagnostic (Quiz Start)                      │    │
│  │  - /diagnostic/result/[id] (Result + Matching)   │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ API Routes (Serverless Functions)               │    │
│  │  - POST /api/diagnostic/submit                   │    │
│  │  - POST /api/match                               │    │
│  │  - POST /api/analyze                             │    │
│  └──────────────┬───────────────────┬───────────────┘    │
└─────────────────┼───────────────────┼──────────────────┘
                  │                   │
       ┌──────────▼──────┐   ┌────────▼──────────────────┐
       │  Gemini API     │   │ PostgreSQL 16 + pgvector  │
       │  (Google Cloud) │   │  (Supabase / Self-hosted) │
       │                 │   │                            │
       │ - gemini-pro    │   │ Tables:                    │
       │ - text-emb-004  │   │  - users                   │
       └─────────────────┘   │  - diagnostic_results      │
                             │  - essence_vectors         │
                             │  - interactions            │
                             │                            │
                             │ pgvector:                  │
                             │  - HNSW index              │
                             │  - Cosine distance (<=>) │
                             │                            │
                             │ Prisma Client 7.4.0        │
                             └────────────────────────────┘
```

### 3.2 レイヤー構成

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  (React Components)                 │
│  - DiagnosticWizard                 │
│  - MatchResults                     │
│  - FeedbackDialog                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  API Layer (Next.js Routes)         │
│  - /api/diagnostic/submit           │
│  - /api/match                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Business Logic Layer               │
│  - lib/gemini.ts (AI分析)           │
│  - lib/rec/engine.ts (マッチング)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Data Access Layer                  │
│  - lib/db/client.ts (Prisma)        │
│  - vectorStore (pgvector wrapper)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Database Layer                     │
│  PostgreSQL 16 + pgvector 0.5.1     │
└─────────────────────────────────────┘
```

---

## 4. データモデル

### 4.1 ベクトル表現の二重構造

ZAXは2種類のベクトルを使用:

| 種類 | 次元数 | 用途 | 生成方法 |
|------|--------|------|----------|
| **V_display** | 6次元 | レーダーチャート表示 | カテゴリ平均スコア |
| **V_essence** | 768次元 | 実際のマッチング | Gemini text-embedding-004 |

**注**: 現在のマッチングは実際にはアーキタイプの6次元ベクトルを使用（実装の簡略化のため）

### 4.2 6次元の意味

| 次元 | ラベル | 説明 | 高い人の特徴 |
|------|--------|------|-------------|
| Dim 0 | 論理性 | 構造的思考、分析力 | データ重視、システマティック |
| Dim 1 | 直感力 | パターン認識、洞察 | 閃き型、大局観 |
| Dim 2 | 共感性 | 感情共鳴、他者理解 | 傾聴力、調和重視 |
| Dim 3 | 意志力 | 推進力、目標達成 | 粘り強い、完遂力 |
| Dim 4 | 創造性 | 発想力、芸術性 | 独創的、常識を疑う |
| Dim 5 | 柔軟性 | 適応力、オープンマインド | 変化を楽しむ、多様性受容 |

### 4.3 スケールの変換

診断の回答スケール: 1-7（1=同意しない, 4=中立, 7=同意する）  
ベクトルのスケール: 0-100

**変換式**:
```typescript
const normalized = Math.round(((rawScore - 1) / 6) * 100);
```

---

## 5. アルゴリズム

### 5.1 補完性スコア（詳細）

**目的**: 「成長を促す相手」を数値化

**仮定**:
- 類似度が高すぎる（0.8-1.0）: エコーチェンバー
- 類似度が低すぎる（0.0-0.2）: 価値観の衝突
- 類似度が中程度（0.3-0.6）: 理想的

**数式**:
```
growthScore(sim) = exp(-(sim - μ)² / σ) × 100

where:
  μ = 0.5  (最適類似度)
  σ = 0.1  (分散: 許容範囲の広さ)
```

**グラフ**:
```
Score
 100 |          ●
     |        ╱   ╲
  90 |      ╱       ╲
  80 |    ╱           ╲
  70 |  ╱               ╲
  60 |╱                   ╲
     +─────────────────────────→ Similarity
     0   0.25  0.5  0.75  1.0
     
最適ゾーン: 0.4 ~ 0.6
```

**実装**:
```typescript
function calculateComplementarityScore(
  userVec: number[],
  targetVec: number[]
): number {
  const sim = cosineSimilarity(userVec, targetVec);
  return Math.exp(-Math.pow(sim - 0.5, 2) / 0.1) * 100;
}
```

### 5.2 コサイン類似度

**定義**:
```
similarity = (A · B) / (||A|| × ||B||)

where:
  A · B = Σ(Ai × Bi)  (内積)
  ||A|| = √(Σ Ai²)    (ベクトルの大きさ)
```

**範囲**: -1（正反対） 〜 +1（完全一致）

**実装**:
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}
```

### 5.3 pgvector 検索

**SQL**:
```sql
SELECT 
  ev.id,
  ev."userId",
  ev."vectorJson",
  ev.reasoning,
  (ev.vector <=> $1::vector) as distance
FROM "essence_vectors" ev
ORDER BY distance ASC
LIMIT 20;
```

**演算子**:
- `<=>`: コサイン距離（distance = 1 - similarity）
- 範囲: 0（完全一致） 〜 2（正反対）

**インデックス**:
```sql
CREATE INDEX idx_essence_vectors_hnsw
ON essence_vectors
USING hnsw (vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**HNSW パラメータ**:
- `m = 16`: グラフの次数（高いほど精度↑、サイズ↑）
- `ef_construction = 64`: 構築時の探索幅

---

## 6. API仕様

### 6.1 POST `/api/diagnostic/submit`

#### リクエスト

```json
{
  "answers": {
    "1": 7,
    "2": 5,
    ...
    "50": 6
  }
}
```

#### レスポンス

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "synthesis": "あなたは論理性と共感性のバランスが良く、分析的でありながら他者の感情にも敏感です。..."
}
```

#### エラー

```json
{
  "success": false,
  "error": "No answers provided"
}
```

#### 処理詳細

1. セッション検証
2. 回答のバリデーション（50問すべてに回答済みか）
3. カテゴリ別スコア集計
4. Gemini Pro API呼び出し（15-20秒）
5. text-embedding-004 API呼び出し（3-5秒）
6. DB保存（diagnostic_results + essence_vectors）

---

### 6.2 POST `/api/match`

#### リクエスト

```json
{
  "vector": [80, 60, 90, 45, 70, 85],
  "topN": 5
}
```

**vector**: 6次元配列（0-100のスケール）  
**topN**: 返却する候補数（デフォルト: 5）

#### レスポンス

```json
{
  "success": true,
  "matches": [
    {
      "matchUser": {
        "id": "A-021",
        "name": "三浦 優奈",
        "vector": [30, 70, 95, 35, 55, 88],
        "bio": "人の痛みを自分のことのように感じる共感力。",
        "tags": ["Empathy", "Compassion"]
      },
      "similarity": 0.52,
      "growthScore": 88,
      "reasoning": "あなたの論理性の高さが、相手の共感性と補完関係にあります。"
    }
  ]
}
```

#### 処理詳細

1. ベクトルのバリデーション（6次元チェック）
2. pgvector検索（`vectorStore.searchSimilar()`）
   - DB接続時: 実際のユーザーから検索
   - DB未接続時: 50人のアーキタイプから検索
3. 各候補のコサイン類似度計算
4. 補完性スコア計算
5. スコア降順でソート → 上位topN件を返却

---

## 7. UI/UX設計

### 7.1 デザイン言語

**コンセプト**: 近未来的グラスモルフィズム

**カラーシステム**:
```css
/* Primary */
--slate-50: #f8fafc;    /* 背景 */
--slate-900: #0f172a;   /* テキスト */

/* Accent */
--indigo-600: #4f46e5;  /* メインアクセント */
--violet-600: #7c3aed;  /* サブアクセント */
--rose-500: #f43f5e;    /* 警告・重要 */
```

**ガラス効果**:
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(226, 232, 240, 0.4);
```

### 7.2 タイポグラフィ

```css
/* フォント */
font-family: Inter, "Noto Sans JP", sans-serif;

/* スケール */
h1: 3xl ~ 7xl (48px ~ 72px)
h2: 2xl ~ 4xl (24px ~ 36px)
h3: xl ~ 2xl (20px ~ 24px)
body: sm ~ base (14px ~ 16px)
caption: xs (12px)
```

### 7.3 アニメーション

**Framer Motion パターン**:

```tsx
// ふわっと出現
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// スクロール連動
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>

// スタガー（順番に出現）
<motion.div
  variants={container}
  initial="hidden"
  animate="show"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={item}
      custom={i}
    >
  ))}
</motion.div>
```

---

## 8. セキュリティ

### 8.1 認証・認可

**現在**: Cookie ベース簡易認証

```typescript
// セッションID生成
const sessionId = crypto.randomUUID();
cookies().set('zax-session', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});
```

**将来**: JWT + Refresh Token

### 8.2 データ暗号化

**AES-256-CBC** で機密データを暗号化:

```typescript
import { encrypt, decrypt } from '@/lib/crypto';

const encrypted = encrypt("sensitive data");
// → "iv:encryptedData" 形式の文字列

const decrypted = decrypt(encrypted);
// → "sensitive data"
```

### 8.3 SQLインジェクション対策

**Prisma の Parameterized Query**:

```typescript
// ✅ 安全
await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;

// ❌ 危険（使用禁止）
await prisma.$executeRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput}'`
);
```

---

## 9. パフォーマンス

### 9.1 ベンチマーク（実測・想定）

| 操作 | 時間 | 最適化 |
|------|------|--------|
| 診断画面読み込み | < 1秒 | SSG |
| 質問1つ回答 | 即時 | クライアント処理 |
| 診断送信 → AI分析 | 15-20秒 | Gemini API（並列化済み） |
| pgvector検索 | < 50ms | HNSW index |
| マッチング結果表示 | < 2秒 | API + レンダリング |

### 9.2 最適化施策

#### フロントエンド
- **Code Splitting**: 動的import
- **Image Optimization**: Next.js Image
- **CSS**: Tailwind CSS（未使用スタイル削除）

#### API
- **並列処理**: Promise.all で Gemini 2回を同時実行
- **キャッシュ**: （将来）診断結果をRedisにキャッシュ

#### データベース
- **HNSW index**: ベクトル検索を10ms未満に
- **Connection Pooling**: Prisma + PgBouncer

---

## 10. デプロイ

### 10.1 環境変数

`.env.local`:
```env
# Gemini API
GOOGLE_API_KEY=AIza...

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/zax?schema=public

# 暗号化キー（32文字）
ENCRYPTION_KEY=your_32_character_encryption_key!
```

### 10.2 Vercel 設定

**環境変数**（Vercel Dashboard）:
- `GOOGLE_API_KEY`
- `DATABASE_URL`（Supabase等の本番DB）
- `ENCRYPTION_KEY`

**ビルドコマンド**:
```bash
npm run build
```

**デプロイ**:
```bash
git push origin main
```
→ 自動デプロイ

---

## 11. 将来拡張

### 11.1 RAG実装（Phase 2）

**データ保存**:
```typescript
// マッチング後のフィードバックを保存
await prisma.interaction.create({
  data: {
    userAId,
    userBId,
    vectorA: JSON.stringify(userVector),
    vectorB: JSON.stringify(partnerVector),
    fulfillmentScore: 8,
    feedbackText: "とても刺激的でした",
  },
});

// フィードバックテキストをembedding化
const feedbackEmbedding = await embeddingModel.embedContent(feedbackText);
```

**RAG検索**:
```typescript
// 新しいマッチング時、過去の類似体験を検索
const similarPastExperiences = await prisma.$queryRaw`
  SELECT *
  FROM interactions
  WHERE "userAId" = ${userId}
  ORDER BY ("vectorA"::vector(6) <=> ${currentVector}::vector(6))
  LIMIT 5
`;

// Gemini に文脈として渡す
const prompt = `
過去の体験:
${similarPastExperiences.map(exp => 
  `- 相手: ${exp.vectorB}, 満足度: ${exp.fulfillmentScore}/10`
).join('\n')}

今回の候補: ${candidateVector}
最適な候補を選んでください。
`;
```

### 11.2 時系列分析（Phase 2-3）

**TimescaleDB Hypertable**:
```sql
SELECT create_hypertable(
  'essence_vectors',
  'createdAt',
  chunk_time_interval => interval '30 days'
);
```

**変化の可視化**:
```sql
SELECT 
  time_bucket('1 week', "createdAt") as week,
  AVG((vectorJson::jsonb->0)::float) as avg_logic
FROM essence_vectors
WHERE "userId" = $1
GROUP BY week
ORDER BY week;
```

### 11.3 Federated Learning（Phase 4）

**個人モデル**:
- ユーザーのデバイス上でローカル学習
- プライバシー保護

**統合モデル**:
- 差分のみをサーバーに送信
- 全体の傾向を学習

---

## 📚 参考文献

- pgvector Documentation: https://github.com/pgvector/pgvector
- Gemini API Docs: https://ai.google.dev/docs
- Next.js App Router: https://nextjs.org/docs
- Framer Motion: https://www.framer.com/motion/

---

**すべてのドキュメントを読み終えたら、実装を開始できます。**
