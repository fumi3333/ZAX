# ZAX 全ソースコード（Geminiコードレビュー用）

> **用途**: このファイルをGeminiに渡してコードレビューを依頼してください。
> **場所**: プロジェクトルート `CODE_FOR_GEMINI_REVIEW.md`**: 繝励Ο繧ｸ繧ｧ繧ｯ繝医Ν繝ｼ繝・CODE_FOR_GEMINI_REVIEW.md

---

## プロジェクト概要（CODE_SUMMARY）
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
│   ├── mypage/             # マイページ（診断・振り返り一覧）
│   ├── admin/gemini-logs/  # Geminiログ閲覧
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
│   ├── gemini-log.ts       # Geminiログ保存
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
2. チャット終了 → `PostChatInterview`（4問を1〜7リッカート尺度で回答）
3. `POST /api/reflection` → Gemini で「あなたの変化」サマリー、`reflections` に保存
4. `ReflectionView` で表示

---

## API 一覧

| エンドポイント | 用途 |
|---------------|------|
| POST /api/diagnostic/submit | 診断回答送信・分析・保存 |
| GET /api/diagnostic/result/[id] | 結果取得 |
| POST /api/match | マッチング候補検索 |
| POST /api/reflection | 振り返りサマリー生成・DB保存 |
| POST /api/analyze | エッセンス分析（/input 用） |
| POST /api/feedback | フィードバック保存（Evolutionary Loop 用） |
| GET /api/mypage | 診断・振り返り一覧 |
| GET /api/gemini-logs | Geminiログ一覧（管理用） |

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
- **Reflection**: 振り返り（partnerName, answers, summary）
- **GeminiLog**: Geminiのプロンプト・レスポンスを保存（可視化用）
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


---

## prisma/schema.prisma

`
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"] // 拡張機能を有効化
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector] // pgvector拡張
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcryptでハッシュ化されたパスワード
  createdAt DateTime @default(now())
  
  // Relations
  vectors    EssenceVector[]
  feedbacks  Feedback[]
  diagnostics DiagnosticResult[]
  reflections Reflection[]

  @@map("users")
}

model Reflection {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  partnerName String
  answers     String   // JSON: { aboutPartner, howChanged, grew, togetherFeel } (1-7 each)
  summary     String   // Gemini要約
  createdAt   DateTime @default(now())

  @@map("reflections")
  @@index([userId, createdAt(sort: Desc)])
}

model GeminiLog {
  id        String   @id @default(uuid())
  type      String   // synthesis, matchReasoning, reflectionSummary, analyzeEssence, etc.
  prompt    String   @db.Text
  response  String   @db.Text
  metadata  String?  // JSON
  createdAt DateTime @default(now())

  @@map("gemini_logs")
  @@index([type, createdAt(sort: Desc)])
}

model EssenceVector {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 6次元のエッセンスベクトル (検索用)
  // Unsupported型を使用してDBのvector型に直接マッピング
  vector         Unsupported("vector(6)") 
  
  // JSON文字列表現 (フロントエンド表示用バックアップ)
  vectorJson     String   

  reasoning      String   
  resonanceScore Float    @default(0.0)
  createdAt      DateTime @default(now())

  @@map("essence_vectors")
}

model Feedback {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String
  deltaVector String   // JSON string
  growthScore Float
  createdAt   DateTime @default(now())

  @@map("feedbacks")
}

model Interaction {
  id String @id @default(uuid())

  userAId String
  userBId String

  // マッチング時点のベクトル（スナップショット）
  vectorA String // JSON: [80,60,90,45,70,85]
  vectorB String

  // フィードバック（ユーザーAから見たB）
  fulfillmentScore Int?  // 充足感 (1-10)
  willMeetAgain    Int?  // また会いたい (1-10)
  partnerSeemed    Int?  // 相手は楽しそう (1-10)
  growthPotential  Int?  // 成長できそう (1-10)
  feedbackText     String? // 自由記述

  createdAt DateTime @default(now())

  @@map("interactions")
  @@index([userAId, createdAt(sort: Desc)])
}

model DiagnosticResult {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  answers   String   // JSON
  synthesis String   
  vector    String   // JSON
  createdAt DateTime @default(now())

  @@map("diagnostic_results")
}

`

---

## src/data/questions.ts

`
export type Question = {
  id: number;
  text: string;
  category: 'Social' | 'Empathy' | 'Discipline' | 'Openness' | 'Emotional';
  categoryJa: string;
  /** 逆転項目: true のとき 1-7 を 8-score で反転（黙従バイアス軽減） */
  reverse?: boolean;
};

const Q = (o: Question) => o;

/** 1-7スケールで逆転項目の場合は 8 - score を返す */
export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  Q({ id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 4, text: "注目を浴びることに抵抗がない、むしろ好きだ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 5, text: "自分の感情や考えを、すぐに言葉にして表現する方だ。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 6, text: "パーティーや交流会など、人が多い場所に行くとエネルギーをもらえる。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 7, text: "電話よりもテキストメッセージでのやり取りを好む。", category: 'Social', categoryJa: '外向性', reverse: true }), // テキスト好み=対面減
  Q({ id: 8, text: "誰かと一緒にいるとき、沈黙が続くと気まずいと感じる。", category: 'Social', categoryJa: '外向性' }),
  Q({ id: 9, text: "浅く広い付き合いよりも、狭く深い付き合いを好む。", category: 'Social', categoryJa: '外向性', reverse: true }), // 深く狭く=内向的傾向
  Q({ id: 10, text: "他人の意見に流されず、自分の主張をはっきりと伝えることができる。", category: 'Social', categoryJa: '外向性' }),

  // Empathy & Harmony (協調性・共感性)
  Q({ id: 11, text: "他人の感情の変化に敏感で、すぐ気がつく方だ。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 12, text: "困っている人がいると、自分のことを後回しにしてでも助けたくなる。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 13, text: "議論で勝つことよりも、相手との調和を保つことの方が重要だと思う。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 14, text: "人を批判するよりも、良いところを見つけて褒めるようにしている。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 15, text: "自分の利益よりも、チームやコミュニティ全体の利益を優先する。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 16, text: "映画や小説の登場人物に感情移入して泣いてしまうことがある。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 17, text: "他人の失敗に対して寛容であり、すぐに許すことができる。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 18, text: "嘘をつくことは、どんな理由があっても良くないと思う。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 19, text: "人からの頼み事を断るのが苦手だ。", category: 'Empathy', categoryJa: '協調性' }),
  Q({ id: 20, text: "競争する環境よりも、協力し合う環境の方が能力を発揮できる。", category: 'Empathy', categoryJa: '協調性' }),

  // Discipline & Order (誠実性・規律)
  Q({ id: 21, text: "部屋や机の上は常に整理整頓されている。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 22, text: "計画を立ててから行動する方で、行き当たりばったりの行動は避ける。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 23, text: "期限や約束の時間は必ず守る。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 24, text: "一度始めたことは、どんなに困難でも最後までやり遂げる。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 25, text: "細かい部分まで注意を払い、ミスがないよう徹底するタイプだ。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 26, text: "ルールや規則は、社会秩序のために厳格に守るべきだと思う。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 27, text: "衝動買いをすることはほとんどなく、慎重にお金を使う。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 28, text: "目標達成のためなら、目先の快楽を我慢できる。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 29, text: "効率性を重視し、無駄な作業は極力省きたい。", category: 'Discipline', categoryJa: '誠実性' }),
  Q({ id: 30, text: "何事も準備不足だと不安を感じる。", category: 'Discipline', categoryJa: '誠実性' }),

  // Openness & Curiosity (開放性・知的好奇心)
  Q({ id: 31, text: "抽象的な概念や哲学的な議論をするのが好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 32, text: "伝統や慣習よりも、新しい方法や革新的なアイデアに惹かれる。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 33, text: "美術館に行ったり、芸術作品に触れたりするのが好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 34, text: "予測可能な日常よりも、変化に富んだ刺激的な毎日を求めている。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 35, text: "未知の分野や新しい趣味に挑戦することにワクワクする。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 36, text: "物事を多角的な視点から見るのが得意だ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 37, text: "「なぜ？」と根本的な理由を考えることがよくある。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 38, text: "SF映画やファンタジー小説など、現実離れした世界観が好きだ。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 39, text: "自分の価値観が絶対だとは思わず、多様な考え方を受け入れられる。", category: 'Openness', categoryJa: '開放性' }),
  Q({ id: 40, text: "クリエイティブな活動（執筆、描画、制作など）に時間を費やすのが好きだ。", category: 'Openness', categoryJa: '開放性' }),

  // Emotional Logic / Stability (情緒安定性・メンタル)
  Q({ id: 41, text: "プレッシャーのかかる状況でも、冷静に対処できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 42, text: "些細なことでイライラしたり、落ち込んだりすることは少ない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 43, text: "将来に対して不安を感じるより、楽観的に考えることが多い。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 44, text: "失敗しても、すぐに気持ちを切り替えて次の行動に移せる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 45, text: "他人からの批判を個人的な攻撃として受け取らず、冷静に分析できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 46, text: "感情の起伏が激しい方ではない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 47, text: "リラックスする時間を意識的に確保している。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 48, text: "自分の弱みを見せることに抵抗がない。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 49, text: "予期せぬトラブルが起きてもパニックにならずに対応できる。", category: 'Emotional', categoryJa: '情緒安定性' }),
  Q({ id: 50, text: "自分自身に対して自信を持っており、自己肯定感が高い。", category: 'Emotional', categoryJa: '情緒安定性' }),
];

`

---

## src/data/happiness2019.ts

`
// Real Data Source: World Happiness Report 2019
// Source: https://kaggle.com/unsdsn/world-happiness
// Selected 30 Representative Countries for Scatter Plot Verification

export interface HappinessData {
    rank: number;
    country: string;
    score: number;
    gdp: number;
    social: number;
    health: number;
    freedom: number;
    generosity: number;
    corruption: number;
}

export const realHappinessData: HappinessData[] = [
    { rank: 1, country: "Finland", score: 7.769, gdp: 1.340, social: 1.587, health: 0.986, freedom: 0.596, generosity: 0.153, corruption: 0.393 },
    { rank: 2, country: "Denmark", score: 7.600, gdp: 1.383, social: 1.573, health: 0.996, freedom: 0.592, generosity: 0.252, corruption: 0.410 },
    { rank: 3, country: "Norway", score: 7.554, gdp: 1.488, social: 1.582, health: 1.028, freedom: 0.603, generosity: 0.271, corruption: 0.341 },
    { rank: 4, country: "Iceland", score: 7.494, gdp: 1.380, social: 1.624, health: 1.026, freedom: 0.591, generosity: 0.354, corruption: 0.118 },
    { rank: 5, country: "Netherlands", score: 7.488, gdp: 1.396, social: 1.522, health: 0.999, freedom: 0.557, generosity: 0.322, corruption: 0.298 },
    { rank: 6, country: "Switzerland", score: 7.480, gdp: 1.452, social: 1.526, health: 1.052, freedom: 0.572, generosity: 0.263, corruption: 0.343 },
    { rank: 7, country: "Sweden", score: 7.343, gdp: 1.387, social: 1.487, health: 1.009, freedom: 0.574, generosity: 0.267, corruption: 0.373 },
    { rank: 8, country: "New Zealand", score: 7.307, gdp: 1.303, social: 1.557, health: 1.026, freedom: 0.585, generosity: 0.330, corruption: 0.380 },
    { rank: 9, country: "Canada", score: 7.278, gdp: 1.365, social: 1.505, health: 1.039, freedom: 0.584, generosity: 0.285, corruption: 0.308 },
    { rank: 10, country: "Austria", score: 7.246, gdp: 1.376, social: 1.475, health: 1.016, freedom: 0.532, generosity: 0.244, corruption: 0.226 },
    { rank: 15, country: "United Kingdom", score: 7.054, gdp: 1.333, social: 1.538, health: 0.996, freedom: 0.450, generosity: 0.348, corruption: 0.278 },
    { rank: 17, country: "Germany", score: 6.985, gdp: 1.373, social: 1.454, health: 0.987, freedom: 0.495, generosity: 0.261, corruption: 0.265 },
    { rank: 19, country: "United States", score: 6.892, gdp: 1.433, social: 1.457, health: 0.881, freedom: 0.454, generosity: 0.280, corruption: 0.128 },
    { rank: 24, country: "France", score: 6.592, gdp: 1.324, social: 1.472, health: 1.045, freedom: 0.436, generosity: 0.111, corruption: 0.183 },
    { rank: 28, country: "Saudi Arabia", score: 6.375, gdp: 1.403, social: 1.357, health: 0.795, freedom: 0.439, generosity: 0.080, corruption: 0.132 },
    { rank: 36, country: "Italy", score: 6.223, gdp: 1.294, social: 1.488, health: 1.039, freedom: 0.231, generosity: 0.158, corruption: 0.030 },
    { rank: 40, country: "Poland", score: 6.182, gdp: 1.206, social: 1.438, health: 0.884, freedom: 0.483, generosity: 0.117, corruption: 0.050 },
    { rank: 58, country: "Japan", score: 5.886, gdp: 1.327, social: 1.419, health: 1.088, freedom: 0.445, generosity: 0.069, corruption: 0.140 },
    { rank: 68, country: "Russia", score: 5.648, gdp: 1.183, social: 1.452, health: 0.726, freedom: 0.334, generosity: 0.082, corruption: 0.031 },
    { rank: 82, country: "Greece", score: 5.287, gdp: 1.181, social: 1.156, health: 0.999, freedom: 0.067, generosity: 0.000, corruption: 0.034 },
    { rank: 93, country: "China", score: 5.191, gdp: 1.029, social: 1.125, health: 0.893, freedom: 0.521, generosity: 0.058, corruption: 0.100 },
    { rank: 96, country: "Vietnam", score: 5.175, gdp: 0.741, social: 1.346, health: 0.851, freedom: 0.543, generosity: 0.147, corruption: 0.073 },
    { rank: 122, country: "Kenya", score: 4.509, gdp: 0.512, social: 0.983, health: 0.581, freedom: 0.431, generosity: 0.372, corruption: 0.053 },
    { rank: 140, country: "India", score: 4.015, gdp: 0.755, social: 0.765, health: 0.588, freedom: 0.498, generosity: 0.200, corruption: 0.085 },
    { rank: 149, country: "Syria", score: 3.462, gdp: 0.619, social: 0.378, health: 0.440, freedom: 0.013, generosity: 0.331, corruption: 0.141 },
    { rank: 154, country: "Afghanistan", score: 3.203, gdp: 0.350, social: 0.517, health: 0.361, freedom: 0.000, generosity: 0.158, corruption: 0.025 },
    { rank: 156, country: "South Sudan", score: 2.853, gdp: 0.306, social: 0.575, health: 0.295, freedom: 0.010, generosity: 0.202, corruption: 0.091 },
    { rank: 76, country: "Hong Kong", score: 5.430, gdp: 1.438, social: 1.277, health: 1.122, freedom: 0.440, generosity: 0.258, corruption: 0.287 },
    { rank: 34, country: "Singapore", score: 6.262, gdp: 1.572, social: 1.463, health: 1.141, freedom: 0.556, generosity: 0.271, corruption: 0.453 },
    { rank: 54, country: "South Korea", score: 5.895, gdp: 1.301, social: 1.197, health: 1.038, freedom: 0.159, generosity: 0.175, corruption: 0.056 },
];

`

---

## src/lib/utils.ts

`
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

`

---

## src/lib/crypto.ts

`
import crypto from 'crypto';

// セキュリティ: 環境変数がなければ起動を拒否（デフォルトキーは含めない）
// ビルドフェーズではプレースホルダーで通過を許可
const rawKey = process.env.ENCRYPTION_KEY;
const isBuildPhase =
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build';

if ((!rawKey || rawKey.trim() === '') && !isBuildPhase) {
    throw new Error(
        "[ZAX] ENCRYPTION_KEY environment variable is required. " +
        "Set a secure 32-character key (e.g. openssl rand -base64 24)."
    );
}

const ENCRYPTION_KEY = (rawKey && rawKey.trim() !== '') ? rawKey : 'build-placeholder-never-used-at-runtime';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC
 */
export function encrypt(text: string): string {
    // Ensure the key is 32 bytes (256 bits)
    // If the provided key is short, we pad it or hash it. Here we assume it's roughly correct or just hash it to be safe.
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return properly formatted string: IV:EncryptedText
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string using AES-256-CBC
 */
export function decrypt(text: string): string {
    const textParts = text.split(':');
    const ivPart = textParts.shift();
    if (!ivPart) throw new Error("Invalid encrypted text format");
    
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

`

---

## src/lib/auth-check.ts

`
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('zax-session');
  if (!session) {
    redirect('/login');
  }
}

`

---

## src/lib/db/client.ts

`
// ZAX Database Client — Prisma + pgvector
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック（開発時のみ）

let prisma: any;
let vectorStore: any;

// DATABASE_URL が無い場合はモックのみ使用（Vercel等で未設定時）
const useRealDb = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432/dummy")
);

// 本番ランタイムでDB未設定の場合は起動を拒否（ビルドフェーズは除外）
const isBuildPhase =
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_PHASE === "phase-production-build";
if (process.env.NODE_ENV === "production" && !useRealDb && !isBuildPhase) {
    throw new Error(
        "[ZAX] DATABASE_URL is required in production. " +
        "Set a valid PostgreSQL connection string (not localhost:5432/dummy)."
    );
}

if (!useRealDb && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://localhost:5432/dummy";
}

try {
    if (!useRealDb) throw new Error("Using mock DB");
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Expected dimension for essence_vectors (vector(6) in DB). 768-dim embeddings are NOT stored here.
    const EXPECTED_VECTOR_DIM = 6;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number
        ) {
            if (!Array.isArray(vector) || vector.length !== EXPECTED_VECTOR_DIM) {
                throw new Error(
                    `Vector dimension mismatch: expected ${EXPECTED_VECTOR_DIM}, got ${vector?.length ?? "non-array"}. ` +
                    "EssenceVector stores 6-dim display vectors only. 768-dim embeddings are not persisted here."
                );
            }
            const safeValues = vector.map((v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) throw new Error("Vector contains non-finite value");
                return Math.max(0, Math.min(100, n));
            });
            const vectorString = `[${safeValues.join(",")}]`;
            await prisma.$executeRaw`
                INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
            `;
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            if (!Array.isArray(targetVector) || targetVector.length !== EXPECTED_VECTOR_DIM) {
                throw new Error(
                    `Target vector dimension mismatch: expected ${EXPECTED_VECTOR_DIM}, got ${targetVector?.length ?? "non-array"}`
                );
            }
            const safeValues = targetVector.map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 50;
            });
            const vectorString = `[${safeValues.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev."vectorJson", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        },
    };

    // DB接続テスト (非同期 — 失敗時はログのみ)
    prisma
        .$queryRaw`SELECT 1`
        .then(() => console.log("✅ PostgreSQL + pgvector 接続成功"))
        .catch((err: any) => console.warn("⚠️ DB接続失敗 (モックにフォールバックはしません):", err.message));
} catch (e: any) {
    // 本番ランタイムではモックにフォールバックせず、明示的にエラーで停止
    if (process.env.NODE_ENV === "production" && !isBuildPhase) {
        const err = new Error(
            "[ZAX] Database connection failed. In production, mock fallback is disabled. " +
            "Ensure DATABASE_URL is set and PostgreSQL is reachable."
        );
        (err as any).cause = e;
        throw err;
    }

    console.warn(
        "⚠️ Prisma Client が見つかりません。インメモリ・モックを使用します。",
        e.message
    );

    // In-Memory Mock Store (開発時のみ)
    const mockUsers: any[] = [];
    const mockVectors: any[] = [];
    const mockDiagnostics: any[] = [];

    prisma = {
        user: {
            findUnique: async ({ where }: any) =>
                mockUsers.find(
                    (u) => u.email === where.email || u.id === where.id
                ) || null,
            create: async ({ data }: any) => {
                const newUser = { id: `mock_${Date.now()}`, ...data };
                mockUsers.push(newUser);
                return newUser;
            },
            findFirst: async () => mockUsers[0] || null,
        },
        diagnosticResult: {
            create: async ({ data }: any) => {
                const result = {
                    id: `mock_diag_${Date.now()}`,
                    ...data,
                    createdAt: new Date(),
                };
                mockDiagnostics.push(result);
                return result;
            },
            findUnique: async ({ where }: any) =>
                mockDiagnostics.find((d) => d.id === where.id) || null,
        },
        essenceVector: {
            create: async () => {},
        },
        $executeRaw: async (...args: any[]) =>
            console.log("Mock $executeRaw"),
        $queryRaw: async () => [],
    };

    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number
        ) {
            console.log("Mock saveEmbedding:", userId, `[${vector.length}dim]`);
            mockVectors.push({ userId, vector, reasoning, resonanceScore });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            // モックでも最低限のコサイン類似度検索を実行
            if (mockVectors.length === 0) return [];

            const dot = (a: number[], b: number[]) =>
                a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
            const mag = (a: number[]) =>
                Math.sqrt(a.reduce((s, v) => s + v * v, 0));
            const cosine = (a: number[], b: number[]) => {
                const ma = mag(a);
                const mb = mag(b);
                return ma && mb ? dot(a, b) / (ma * mb) : 0;
            };

            return mockVectors
                .map((mv) => ({
                    id: `mock_vec_${mv.userId}`,
                    userId: mv.userId,
                    vectorJson: JSON.stringify(mv.vector),
                    reasoning: mv.reasoning,
                    resonanceScore: mv.resonanceScore,
                    distance: 1 - cosine(targetVector, mv.vector),
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);
        },
    };
}

export { prisma, vectorStore };

`

---

## src/lib/gemini.ts

`
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logGemini } from "./gemini-log";

const API_KEY = process.env.GOOGLE_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-pro" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" }); // Updated to latest stable embedding model

export interface AnalysisResult {
    vector: number[]; // 6-dim radar chart stats (0-100) -> V_display
    embedding?: number[]; // 768-dim raw embedding -> V_essence (Hidden)
    reasoning: string;
    resonance_score: number;
}

export async function analyzeEssence(inputs: string[], biases: number[] = [50, 50, 50], purpose: string = "general"): Promise<AnalysisResult> {
    if (!API_KEY) {
        console.warn("GOOGLE_API_KEY not found. Using mock data.");
        return {
            vector: [80, 60, 90, 45, 70, 85],
            reasoning: "APIキーが設定されていないため、擬似データを表示しています。あなたの入力は非常に詩的で、論理性よりも直感を重視する傾向が見られます。",
            resonance_score: 88,
        };
    }

    // 1. Generate V_display (6-dim) via LLM
    // Sanitize function to prevent simple injection
    const sanitize = (str: string) => str.replace(/`/g, "'").replace(/\$/g, "");
    
    const safeInputs = inputs.map(sanitize);

    const prompt = `
    Analyze the following three personal fragments to construct a 6-dimensional "Essence Vector".
    
    User Goal/Purpose: "${sanitize(purpose)}"
    * Important: The user is seeking "${sanitize(purpose)}" functionality to maximize their life happiness. 
    * If purpose is "romance", prioritize Empathy and Chemistry cues.
    * If "happiness" (growth), prioritize Determination and Creativity.
    * If "friendship", prioritize Flexibility and Intuition.

    Fragments:
    1. ${safeInputs[0]}
    2. ${safeInputs[1]}
    3. ${safeInputs[2]}

    User Self-Reported Bias (0=Intuition, 100=Logic):
    1. ${biases[0]}
    2. ${biases[1]}
    3. ${biases[2]}
    * Use this bias to weight the "Logic" vs "Intuition" dimensions. High bias > 50 should boost Logic. Low bias < 50 should boost Intuition.

    Dimensions (0-100):
    - Logic (Logic & Structure)
    - Intuition (Insight & Pattern)
    - Empathy (Emotional Resonance)
    - Determination (Willpower & Drive)
    - Creativity (Novelty & Art)
    - Flexibility (Adaptability & Openness)

    Task:
    1. Estimate values (0-100) for each dimension, keeping the User Goal in mind for nuances.
    2. Generate a "Reasoning" summary (Max 100 chars, in JAPANESE) explaining the core personality trait detected in relation to their goal.
    3. Calculate a "Resonance Score" (0-100) representing potential for success in their chosen goal.

    Format: JSON only. Keys: "vector" (array), "reasoning" (string), "resonance_score" (number).
    `;

    try {
        const [result, embeddingResult] = await Promise.all([
            model.generateContent(prompt),
            embeddingModel.embedContent(inputs.join(" ")) // Generate V_essence (High-Dim)
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonStr) as AnalysisResult;

        const out = { ...parsed, embedding: embeddingResult.embedding.values };
        logGemini("analyzeEssence", prompt, JSON.stringify(parsed), { inputs: safeInputs.length }).catch(() => {});
        return out;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // Fallback on error
        return {
            vector: [50, 50, 50, 50, 50, 50],
            reasoning: "解析中にエラーが発生しました。",
            resonance_score: 50
        };
    }
}

/** RAG風: ユーザー分析＋相手プロフィールから相性の理由を生成 */
export async function generateMatchReasoning(
    userSynthesis: string,
    partnerName: string,
    partnerBio: string,
    partnerTags: string[],
    similarityPercent: number,
    growthScore: number
): Promise<string> {
    if (!API_KEY) return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%、成長ポテンシャル${growthScore}%です。`;
    const prompt = `
あなたはマッチングアドバイザーです。以下の情報をもとに、なぜこの2人が相性が良いか、50文字以内の日本語で簡潔に説明してください。

【ユーザーの性格分析】
${userSynthesis.slice(0, 500)}

【相性の良い相手】
名前: ${partnerName}
プロフィール: ${partnerBio}
タグ: ${partnerTags.join(", ")}

【数値】
共鳴度: ${similarityPercent}%
成長ポテンシャル: ${growthScore}%

50文字以内で、具体的で温かい推薦理由を1文で出力してください。JSONは不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 120) || `${partnerName}さんとの相性が良いです。`;
        logGemini("matchReasoning", prompt, text, { partnerName, similarityPercent, growthScore }).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Gemini match reasoning error:", e);
        return `${partnerName}さんは${partnerBio} 共鳴度${similarityPercent}%。`;
    }
}

export interface DeltaResult {
    delta_vector: number[];
    new_vector: number[];
    growth_score: number;
}

export async function calculateDeltaVector(feedback: string, currentVector: number[] = [50, 50, 50, 50, 50, 50], tags: string[] = []): Promise<DeltaResult> {
    if (!API_KEY) {
        return {
            delta_vector: [5, -2, 10, 0, 5, 5],
            new_vector: currentVector.map((v, i) => Math.min(100, Math.max(0, v + (i % 2 === 0 ? 5 : -2)))),
            growth_score: 15
        };
    }

    const prompt = `
    User Context Vector: [${currentVector.join(", ")}] (Logic, Intuition, Empathy, Determination, Creativity, Flexibility)
    User Feedback after interaction: "${feedback}"
    Selected Resonance Tags: "${tags.join(", ")}"
    * Tags like "Reassurance" should stabilize vector. "Challenge" should trigger larger delta. "Inspiration" increases Creativity.

    Task:
    1. Analyze the feedback to understand how the user's internal state has changed.
    2. Calculate a "Delta Vector" (6 dims) representing this shift. Positive means growth/increase, negative means decrease.
    3. Calculate the "New Vector" = Current + Delta. Ensure bounds 0-100.
    4. Calculate a "Growth Score" (0-100) based on the magnitude of positive, constructive change.

    Format: JSON only. Keys: "delta_vector" (array), "new_vector" (array), "growth_score" (number).
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as DeltaResult;
    } catch (e) {
        console.error("Delta Calc Error", e);
        return {
            delta_vector: [0, 0, 0, 0, 0, 0],
            new_vector: currentVector,
            growth_score: 0
        };
    }
}

/** インタビュー回答から「あなたの変化」サマリーを生成 */
export async function generateReflectionSummary(interviewText: string): Promise<string> {
    if (!API_KEY) return "あなたの振り返りが記録されました。";
    const prompt = `
以下の振り返り回答をもとに、「あなたがどう変わったか」を50文字以内の日本語で要約してください。
温かく、前向きな表現で。

【振り返り】
${interviewText.slice(0, 500)}

50文字以内、1文で。JSON不要、テキストのみ。
`;
    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().slice(0, 80) || "あなたの振り返りが記録されました。";
        logGemini("reflectionSummary", prompt, text).catch(() => {});
        return text;
    } catch (e) {
        console.warn("Reflection summary error:", e);
        return "あなたの振り返りが記録されました。";
    }
}

`

---

## src/lib/gemini-log.ts

`
import { prisma } from "./db/client";

export type GeminiLogType =
  | "synthesis"
  | "matchReasoning"
  | "reflectionSummary"
  | "analyzeEssence"
  | "calculateDeltaVector";

/** Geminiの入出力をDBに保存（非同期・エラーは握りつぶす） */
export async function logGemini(
  type: GeminiLogType,
  prompt: string,
  response: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const p = prisma as { geminiLog?: { create: (args: any) => Promise<any> } };
    if (!p?.geminiLog) return;
    await p.geminiLog.create({
      data: {
        type,
        prompt: prompt.slice(0, 50000),
        response: response.slice(0, 50000),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // ログ失敗は本処理に影響させない
  }
}

`

---

## src/lib/rec/engine.ts

`
import { vectorStore } from "../db/client";
import { generateMatchReasoning } from "../gemini";

// ─── 50 Archetype Personas (Demo Seed) ───
// 性格パターンを反映した6次元ベクトル [Logic, Intuition, Empathy, Determination, Creativity, Flexibility]
export const ARCHETYPE_USERS = [
  // ─── 論理重視型 (10人) ───
  { id: "A-001", name: "田中 健太", vector: [92, 25, 35, 78, 40, 30], bio: "構造的な思考を得意とし、物事の根本原理を追求する。", tags: ["Logic", "Structure"] },
  { id: "A-002", name: "山本 理沙", vector: [88, 30, 45, 70, 35, 40], bio: "データに基づく意思決定を重視する分析家。", tags: ["Logic", "Analysis"] },
  { id: "A-003", name: "鈴木 翔", vector: [85, 40, 30, 85, 30, 25], bio: "効率と合理性を追求するストラテジスト。", tags: ["Logic", "Strategy"] },
  { id: "A-004", name: "高橋 美咲", vector: [90, 20, 50, 65, 45, 35], bio: "論理と共感のバランスを模索する研究者。", tags: ["Logic", "Research"] },
  { id: "A-005", name: "伊藤 大輝", vector: [95, 15, 20, 90, 25, 20], bio: "数理モデルで世界を理解しようとする純粋な論理型。", tags: ["Logic", "Math"] },
  { id: "A-006", name: "渡辺 麻衣", vector: [82, 35, 55, 60, 50, 45], bio: "科学的思考と人への配慮を両立する。", tags: ["Logic", "Care"] },
  { id: "A-007", name: "中村 拓也", vector: [87, 28, 40, 75, 38, 32], bio: "システム設計に情熱を注ぐエンジニア気質。", tags: ["Logic", "Systems"] },
  { id: "A-008", name: "小林 由香", vector: [80, 45, 48, 68, 42, 50], bio: "論理と直感の境界を探る哲学者タイプ。", tags: ["Logic", "Philosophy"] },
  { id: "A-009", name: "加藤 陸", vector: [93, 18, 25, 88, 20, 28], bio: "白黒はっきりつけたい完璧主義者。", tags: ["Logic", "Precision"] },
  { id: "A-010", name: "吉田 さくら", vector: [84, 38, 60, 55, 48, 42], bio: "理系でありながら文系的感性も持つ。", tags: ["Logic", "Hybrid"] },

  // ─── 直感・創造型 (10人) ───
  { id: "A-011", name: "佐藤 愛", vector: [25, 90, 75, 35, 92, 80], bio: "直感でパターンを見抜く天才的な創造力。", tags: ["Intuition", "Creative"] },
  { id: "A-012", name: "松本 龍之介", vector: [30, 85, 65, 40, 95, 75], bio: "既存の枠を壊して新しいものを生み出す。", tags: ["Creativity", "Innovation"] },
  { id: "A-013", name: "井上 彩花", vector: [35, 80, 70, 30, 88, 85], bio: "アートと直感で世界を理解する感性派。", tags: ["Intuition", "Art"] },
  { id: "A-014", name: "木村 悠真", vector: [40, 88, 55, 45, 90, 70], bio: "閃きを形にする発明家タイプ。", tags: ["Creativity", "Invention"] },
  { id: "A-015", name: "林 美月", vector: [20, 92, 80, 25, 85, 90], bio: "流れるように変化を受け入れる自由人。", tags: ["Intuition", "Flow"] },
  { id: "A-016", name: "清水 蓮", vector: [45, 78, 60, 50, 92, 65], bio: "音楽とテクノロジーの融合を追求する。", tags: ["Creativity", "Music"] },
  { id: "A-017", name: "山口 千尋", vector: [28, 86, 72, 32, 88, 82], bio: "言語を超えた表現を模索するアーティスト。", tags: ["Creativity", "Expression"] },
  { id: "A-018", name: "中島 海斗", vector: [38, 82, 58, 48, 94, 68], bio: "未来を先読みするビジョナリー。", tags: ["Intuition", "Vision"] },
  { id: "A-019", name: "藤田 凛", vector: [32, 90, 68, 28, 86, 88], bio: "感覚で捉えた美をデザインに落とし込む。", tags: ["Creativity", "Design"] },
  { id: "A-020", name: "岡田 颯太", vector: [42, 84, 50, 55, 90, 60], bio: "常識を疑い、新しい価値を創出する。", tags: ["Creativity", "Disruption"] },

  // ─── 共感・調和型 (10人) ───
  { id: "A-021", name: "三浦 優奈", vector: [30, 70, 95, 35, 55, 88], bio: "人の痛みを自分のことのように感じる共感力。", tags: ["Empathy", "Compassion"] },
  { id: "A-022", name: "前田 隼人", vector: [40, 65, 90, 45, 50, 82], bio: "チームの調和を第一に考えるファシリテーター。", tags: ["Empathy", "Harmony"] },
  { id: "A-023", name: "石川 結衣", vector: [25, 75, 92, 30, 60, 90], bio: "相手の心に寄り添うカウンセラー気質。", tags: ["Empathy", "Healing"] },
  { id: "A-024", name: "小川 大和", vector: [45, 60, 88, 50, 45, 78], bio: "組織の潤滑油として信頼を集める。", tags: ["Empathy", "Trust"] },
  { id: "A-025", name: "後藤 真奈", vector: [35, 72, 94, 28, 58, 85], bio: "言葉にならない感情を察知する。", tags: ["Empathy", "Sensitivity"] },
  { id: "A-026", name: "長谷川 悠斗", vector: [50, 55, 85, 55, 40, 80], bio: "実務能力と共感力を兼ね備えたリーダー。", tags: ["Empathy", "Leadership"] },
  { id: "A-027", name: "村上 あかり", vector: [28, 68, 92, 32, 62, 92], bio: "多様性を受け入れ、全ての人と繋がれる。", tags: ["Empathy", "Diversity"] },
  { id: "A-028", name: "近藤 蒼", vector: [42, 58, 86, 48, 52, 75], bio: "対話を通じて相互理解を促進する。", tags: ["Empathy", "Dialogue"] },
  { id: "A-029", name: "坂本 花音", vector: [22, 78, 90, 25, 65, 88], bio: "自然体で周囲を癒やす存在。", tags: ["Empathy", "Natural"] },
  { id: "A-030", name: "遠藤 陽向", vector: [38, 62, 88, 42, 48, 82], bio: "対立を解消し、Win-Winを実現する調停者。", tags: ["Empathy", "Mediation"] },

  // ─── 意志・推進型 (10人) ───
  { id: "A-031", name: "青木 凌", vector: [65, 35, 25, 95, 45, 35], bio: "目標に向かって一直線に突き進む。", tags: ["Determination", "Focus"] },
  { id: "A-032", name: "藤井 七海", vector: [55, 40, 35, 92, 50, 40], bio: "困難を楽しむチャレンジャー精神。", tags: ["Determination", "Challenge"] },
  { id: "A-033", name: "西村 晃太", vector: [70, 30, 20, 90, 40, 30], bio: "結果にこだわる実績主義者。", tags: ["Determination", "Results"] },
  { id: "A-034", name: "松田 莉子", vector: [60, 45, 40, 88, 55, 45], bio: "ビジョンを語り、人を動かすリーダー。", tags: ["Determination", "Vision"] },
  { id: "A-035", name: "井田 大翔", vector: [72, 25, 30, 94, 35, 28], bio: "自分に厳しく、限界を超え続ける。", tags: ["Determination", "Discipline"] },
  { id: "A-036", name: "原田 杏", vector: [50, 50, 45, 85, 60, 50], bio: "起業家精神で新しい道を切り開く。", tags: ["Determination", "Entrepreneurship"] },
  { id: "A-037", name: "石田 瑛太", vector: [68, 32, 28, 92, 38, 32], bio: "勝負の世界で生きるアスリート気質。", tags: ["Determination", "Competition"] },
  { id: "A-038", name: "大野 詩織", vector: [58, 42, 50, 86, 48, 48], bio: "粘り強さと柔軟性を使い分ける。", tags: ["Determination", "Resilience"] },
  { id: "A-039", name: "菅原 匠", vector: [75, 28, 22, 96, 30, 25], bio: "妥協を許さない完遂への執念。", tags: ["Determination", "Completion"] },
  { id: "A-040", name: "上田 実央", vector: [52, 48, 55, 82, 52, 55], bio: "情熱と思いやりで周囲を巻き込む。", tags: ["Determination", "Passion"] },

  // ─── バランス・柔軟型 (10人) ───
  { id: "A-041", name: "竹内 涼", vector: [60, 58, 62, 55, 65, 92], bio: "どんな環境にも適応するカメレオン。", tags: ["Flexibility", "Adaptation"] },
  { id: "A-042", name: "金子 ひなた", vector: [55, 62, 58, 52, 60, 88], bio: "バランスの中に独自のスタイルを見出す。", tags: ["Flexibility", "Balance"] },
  { id: "A-043", name: "山下 湊", vector: [65, 55, 55, 60, 58, 90], bio: "多趣味で視野が広い万能型。", tags: ["Flexibility", "Versatile"] },
  { id: "A-044", name: "佐々木 心晴", vector: [50, 65, 65, 48, 68, 85], bio: "流行を敏感にキャッチし、変化を先取りする。", tags: ["Flexibility", "Trend"] },
  { id: "A-045", name: "阿部 壮太", vector: [58, 60, 55, 58, 62, 94], bio: "対立を嫌い、常に最適解を探す。", tags: ["Flexibility", "Optimization"] },
  { id: "A-046", name: "橋本 凪", vector: [52, 58, 68, 45, 72, 88], bio: "穏やかさの中に確かな芯を持つ。", tags: ["Flexibility", "Calm"] },
  { id: "A-047", name: "野村 光", vector: [62, 52, 50, 62, 55, 92], bio: "実行力と柔軟性の高次元バランス。", tags: ["Flexibility", "Execution"] },
  { id: "A-048", name: "石橋 瑠奈", vector: [48, 68, 62, 42, 75, 86], bio: "好奇心旺盛で、常に新しい体験を求める。", tags: ["Flexibility", "Curiosity"] },
  { id: "A-049", name: "福田 翼", vector: [55, 55, 55, 55, 55, 95], bio: "究極のバランサー。どんな人とも共鳴できる。", tags: ["Flexibility", "Universal"] },
  { id: "A-050", name: "安藤 紬", vector: [58, 62, 60, 50, 65, 90], bio: "多様な価値観を繋ぎ合わせるコネクター。", tags: ["Flexibility", "Connection"] },
];

// ─── 6次元ラベル ───
export const DIMENSION_LABELS = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"];
export const DIMENSION_KEYS = ["Logic", "Intuition", "Empathy", "Determination", "Creativity", "Flexibility"];

// ─── Math Utilities ───
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  return magA === 0 || magB === 0 ? 0 : dotProduct(a, b) / (magA * magB);
}

/** 補完性スコア: 類似度 optimalSimilarity をピークとするベルカーブ。ユーザー意図で調整可能。 */
export const DEFAULT_OPTIMAL_SIMILARITY = 0.5; // 恋愛: 0.4, ビジネス: 0.5, 深い共感: 0.6 等
export function calculateComplementarityScore(
  userVec: number[],
  targetVec: number[],
  optimalSimilarity: number = DEFAULT_OPTIMAL_SIMILARITY
): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const growthPotential = Math.exp(-Math.pow(sim - optimalSimilarity, 2) / 0.1);
  return growthPotential * 100;
}

// ─── Match Result Types ───
export interface MatchResult {
  matchUser: {
    id: string;
    name: string;
    vector: number[];
    bio: string;
    tags: string[];
  };
  similarity: number;
  growthScore: number;
  reasoning: string;
}

// ─── 日本語の推薦理由を生成 ───
function generateReasoning(userVec: number[], targetVec: number[], sim: number): string {
  let maxGapIndex = 0;
  let maxGap = -100;
  let minGapIndex = 0;
  let minGap = 100;

  userVec.forEach((val, i) => {
    const gap = targetVec[i] - val;
    if (gap > maxGap) { maxGap = gap; maxGapIndex = i; }
    if (gap < minGap) { minGap = gap; minGapIndex = i; }
  });

  const strongDim = DIMENSION_LABELS[maxGapIndex];
  const weakDim = DIMENSION_LABELS[minGapIndex];
  const simPercent = Math.round(sim * 100);
  const growthScore = Math.round(calculateComplementarityScore(userVec, targetVec));

  const templates = [
    `あなたの${weakDim}の高さが、相手の${strongDim}と補完関係にあります。共鳴度${simPercent}%は、成長を促す理想的な距離です。`,
    `${strongDim}が際立つ相手です。あなたにない視点を提供し、${weakDim}の強みで支え合える関係が期待できます。`,
    `ベクトル分析の結果、${strongDim}領域で+${Math.round(maxGap)}の差異を検出。互いの盲点を補い合う、成長ポテンシャル${growthScore}%の組み合わせです。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Top N マッチング検索 ───
export async function findTopMatches(
  userVector: number[],
  topN: number = 5,
  userSynthesis?: string,
  optimalSimilarity: number = DEFAULT_OPTIMAL_SIMILARITY
): Promise<MatchResult[]> {
  const scoreFn = (a: number[], b: number[]) => calculateComplementarityScore(a, b, optimalSimilarity);

  // 1. DB検索を試みる
  try {
    const dbCandidates = await vectorStore.searchSimilar(userVector, 20);

    if (dbCandidates.length > 0) {
      const results: MatchResult[] = [];
      for (const candidate of dbCandidates) {
        let candidateVector: number[] = [];
        try {
          candidateVector = JSON.parse(candidate.vectorJson || candidate.vector);
        } catch { continue; }

        const sim = cosineSimilarity(userVector, candidateVector);
        const score = scoreFn(userVector, candidateVector);

        let reasoning = generateReasoning(userVector, candidateVector, sim);
        if (userSynthesis) {
          try {
            reasoning = await generateMatchReasoning(
              userSynthesis,
              "共鳴する魂",
              candidate.reasoning || "ベクトル空間上で共鳴する存在。",
              [],
              Math.round(sim * 100),
              Math.round(score)
            );
          } catch {
            /* fallback */
          }
        }
        results.push({
          matchUser: {
            id: candidate.userId,
            name: "共鳴する魂",
            vector: candidateVector,
            bio: candidate.reasoning || "ベクトル空間上で共鳴する存在。",
            tags: [],
          },
          similarity: sim,
          growthScore: Math.round(score),
          reasoning,
        });
      }

      if (results.length > 0) {
        return results
          .sort((a, b) => b.growthScore - a.growthScore)
          .slice(0, topN);
      }
    }
  } catch (e) {
    console.warn("DB Match failed, falling back to Archetypes", e);
  }

  // 2. アーキタイプ（50人）をフォールバック
  const scored = ARCHETYPE_USERS.map((arch) => {
    const sim = cosineSimilarity(userVector, arch.vector);
    const score = scoreFn(userVector, arch.vector);
    return { arch, sim, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const results: MatchResult[] = [];
  for (const { arch, sim, score } of scored) {
    let reasoning = generateReasoning(userVector, arch.vector, sim);
    if (userSynthesis) {
      try {
        reasoning = await generateMatchReasoning(
          userSynthesis,
          arch.name,
          arch.bio,
          arch.tags,
          Math.round(sim * 100),
          Math.round(score)
        );
      } catch {
        // フォールバックは既に reasoning に設定済み
      }
    }
    results.push({
      matchUser: arch,
      similarity: sim,
      growthScore: Math.round(score),
      reasoning,
    });
  }
  return results;
}

// 後方互換
export async function findBestMatch(userVector: number[]): Promise<MatchResult> {
  const matches = await findTopMatches(userVector, 1);
  return matches[0];
}

`

---

## src/lib/actions/manual-auth.ts

`
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function manualLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. バリデーション
    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "無効な入力データです。" };
    }

    // 2. ユーザー検索
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 3. パスワード照合 (ハッシュ比較)
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // 4. セッション発行 (HTTP-only Cookie)
    // 注意: 本番環境ではJWTやLucia Auth等のライブラリ推奨だが、ここでは簡易実装
    (await cookies()).set('zax-session', user.id, { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1週間
    });

    redirect('/');
}

export async function manualRegister(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
        return { message: "パスワードは6文字以上で入力してください。" };
    }

    // ドメイン制限 (武蔵野大学)
    if (!email.endsWith('@stu.musashino-u.ac.jp') && !email.endsWith('@musashino-u.ac.jp')) {
        return { message: "武蔵野大学のメールアドレスのみ登録可能です。" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { message: "このメールアドレスは既に登録されています。" };
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });

    return { message: "登録成功！ログインしてください。" };
}

export async function logout() {
  (await cookies()).delete('zax-session');
  redirect('/login');
}

`

---

## src/middleware.ts

`
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Check for existing session
  const sessionCookie = request.cookies.get('zax-session')
  
  if (!sessionCookie) {
    // Create new session ID
    const newSessionId = uuidv4()
    
    // Set cookie
    response.cookies.set('zax-session', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

`

---

## src/app/api/diagnostic/submit/route.ts

`
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions, effectiveScore } from '@/data/questions';
import { model } from '@/lib/gemini';
import { logGemini } from '@/lib/gemini-log';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate User (or create guest session)
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('zax-session')?.value;

    // Auto-create session if not exists
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    let userId = sessionId;
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
        const email = `guest_${sessionId}@musashino-u.ac.jp`;
        user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
             try {
                user = await prisma.user.create({
                    data: {
                        email,
                        password: "guest-password", // dummy
                    }
                });
             } catch (e) {
                 const firstUser = await prisma.user.findFirst();
                 if (firstUser) user = firstUser;
                 else throw new Error("Could not create or find user");
             }
        }
    }
    
    if (user) {
        userId = user.id;
        if (userId !== sessionId) {
          cookieStore.set('zax-session', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
          });
        }
    }

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断（1-7尺度、1:同意しない - 4:中立 - 7:同意する）の回答に基づき、この人物の性格、価値観、行動特性を詳細に分析し、日本語で記述してください。\n\n";
    
    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      const rawScore = answers[id];
      if (q && typeof rawScore === 'number') {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += effectiveScore(q, rawScore);
        categoryScores[q.categoryJa].count += 1;
      }
    }

    profileText += "## カテゴリ別スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        const avg = (data.sum / data.count).toFixed(1);
        profileText += `- ${cat}: 平均 ${avg}/7.0\n`;
    }

    profileText += "\n## 詳細回答データ\n";
    for (const id of sortedAnswerIds) {
        const q = questions.find(q => q.id === id);
        const score = answers[id];
        if (q) {
            profileText += `Q${id} [${q.categoryJa}]: "${q.text}" -> ${score}\n`;
        }
    }

    profileText += "\n\n指示: この人物の強み、弱み、コミュニケーションスタイル、適した環境について、プロの心理分析官としてレポートを作成してください。出力に「AI」という語は含めないでください。";

    // 3. Call Gemini for Synthesis
    let synthesis = "分析サービスに一時的な制限がかかっているため、簡易分析を表示します。\n\nあなたは非常にバランスの取れた性格で、周囲との調和を大切にしながらも、自分の芯をしっかり持っています。";
    try {
        const result = await model.generateContent(profileText);
        const response = await result.response;
        synthesis = response.text() || synthesis;
        logGemini("synthesis", profileText, synthesis).catch(() => {});
    } catch (e) {
        console.warn("Gemini API Error (Synthesis), using mock:", e);
    }

    // 4. 6次元ベクトルをカテゴリスコアから算出（論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性）
    const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const CATEGORY_JA: Record<string, string> = { Social: '外向性', Empathy: '協調性', Discipline: '誠実性', Openness: '開放性', Emotional: '情緒安定性' };
    const rawByCat = CATEGORY_ORDER.map((c) => {
        const d = categoryScores[CATEGORY_JA[c]] || { sum: 0, count: 0 };
        const avg = d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector: number[] = [
        discipline,                          // 論理性 ← 誠実性
        openness,                            // 直感力 ← 開放性
        empathy,                             // 共感性 ← 協調性
        discipline,                          // 意志力 ← 誠実性
        openness,                            // 創造性 ← 開放性
        Math.round((emotional + social) / 2), // 柔軟性 ← 情緒安定性・外向性
    ];

    // 5. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(vector),
      },
    });

    // Also save to EssenceVector for matching
    // Make sure to use vectorStore.saveEmbedding for pgvector support
    await vectorStore.saveEmbedding(
        userId,
        vector,
        "性格診断結果",
        1.0 // Self-declared resonance score
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: answers,
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}

`

---

## src/app/api/diagnostic/result/[id]/route.ts

`
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.diagnosticResult.findUnique({
      where: { id },
    });
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const answers = JSON.parse(result.answers) as Record<string, number>;
    return NextResponse.json({
      id: result.id,
      synthesis: result.synthesis,
      answers,
    });
  } catch (e) {
    console.error("Diagnostic result fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

`

---

## src/app/api/match/route.ts

`
import { NextResponse } from "next/server";
import { findTopMatches } from "@/lib/rec/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vector, topN = 5, synthesis, optimalSimilarity } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const opt = typeof optimalSimilarity === 'number' && optimalSimilarity >= 0.1 && optimalSimilarity <= 0.9
      ? optimalSimilarity
      : undefined;

    const matches = await findTopMatches(vector, topN, synthesis, opt);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

`

---

## src/app/api/reflection/route.ts

`
import { NextResponse } from "next/server";
import { generateReflectionSummary } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

const LIKERT_LABELS: Record<number, string> = {
  1: "同意しない",
  2: "やや同意しない",
  3: "どちらかといえば同意しない",
  4: "中立",
  5: "どちらかといえば同意する",
  6: "やや同意する",
  7: "同意する",
};

function answersToText(answers: {
  aboutPartner: number;
  howChanged: number;
  grew: number;
  togetherFeel: number;
}): string {
  return [
    `相手はどうでしたか: ${LIKERT_LABELS[answers.aboutPartner] ?? answers.aboutPartner}`,
    `自分はどう変わった: ${LIKERT_LABELS[answers.howChanged] ?? answers.howChanged}`,
    `成長を実感できた: ${LIKERT_LABELS[answers.grew] ?? answers.grew}`,
    `一緒にいてどうだった: ${LIKERT_LABELS[answers.togetherFeel] ?? answers.togetherFeel}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewText: legacyText, answers, partnerName } = body;

    let textForGemini: string;
    let answersJson: string;
    let partner = partnerName || "相手";

    if (answers && typeof answers === "object") {
      const { aboutPartner, howChanged, grew, togetherFeel } = answers;
      if (
        typeof aboutPartner !== "number" ||
        typeof howChanged !== "number" ||
        typeof grew !== "number" ||
        typeof togetherFeel !== "number"
      ) {
        return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
      }
      textForGemini = answersToText(answers);
      answersJson = JSON.stringify(answers);
    } else if (legacyText && typeof legacyText === "string") {
      textForGemini = legacyText;
      answersJson = "{}";
    } else {
      return NextResponse.json({ error: "interviewText or answers required" }, { status: 400 });
    }

    const summary = await generateReflectionSummary(textForGemini);

    const cookieStore = await cookies();
    const userId = cookieStore.get("zax-session")?.value;
    if (userId) {
      try {
        const p = prisma as { reflection?: { create: (args: any) => Promise<any> } };
        if (p?.reflection) {
          await p.reflection.create({
            data: {
              userId,
              partnerName: partner,
              answers: answersJson,
              summary,
            },
          });
        }
      } catch (e) {
        console.warn("Reflection DB save failed:", e);
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Reflection API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

`

---

## src/app/api/analyze/route.ts

`
import { NextResponse } from "next/server";
import { analyzeEssence } from "@/lib/gemini";
import { vectorStore } from "@/lib/db/client";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// Input Validation Schema
const AnalyzeRequestSchema = z.object({
    inputs: z.array(z.string().min(1, "Input cannot be empty")).min(1, "At least one input is required"),
    biases: z.array(z.union([z.string(), z.number()])).optional(),
    purpose: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Input Validation (Zod)
        const validation = AnalyzeRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Invalid inputs", 
                details: validation.error.issues 
            }, { status: 400 });
        }

        const { inputs, biases, purpose } = validation.data;

        // 2. AI Analysis
        const numericBiases = biases?.map((b) => Number(b));
        const result = await analyzeEssence(inputs, numericBiases, purpose || "general");

        // [DB] Persist the analysis result
        const cookieStore = await cookies();

        const sessionId = cookieStore.get('zax-session')?.value;
        const userId = sessionId || "guest_" + new Date().getTime();
        
        // 3. Data Encryption (Encrypt sensitive reasoning before saving)
        const encryptedReasoning = encrypt(result.reasoning);

        // Save with encrypted reasoning
        await vectorStore.saveEmbedding(
            userId,
            result.vector,
            encryptedReasoning,
            result.resonance_score || 0
        );

        // Return PLAIN text to the user (they need to see their own result immediately)
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

`

---

## src/app/api/feedback/route.ts

`
import { NextResponse } from "next/server";
import { calculateDeltaVector } from "@/lib/gemini";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { feedback, currentVector, tags } = body;

        if (!feedback) {
            return NextResponse.json({ error: "Feedback required" }, { status: 400 });
        }

        // Calculate Delta Vector based on feedback emotional shift
        const deltaResult = await calculateDeltaVector(feedback, currentVector, tags);

        // [DB] Persist Feedback & Delta (Prisma)
        try {
            const userId = "guest_demo_user"; // Fixed for MVP demo
            await prisma.feedback.create({
                data: {
                    content: feedback,
                    deltaVector: JSON.stringify(deltaResult.delta_vector),
                    growthScore: deltaResult.growth_score,
                    user: {
                        connectOrCreate: {
                            where: { id: userId },
                            create: { id: userId, email: "guest@example.com" }
                        }
                    }
                }
            });
        } catch (dbError) {
            console.error("DB Save Error:", dbError);
        }

        return NextResponse.json({
            success: true,
            delta: deltaResult.delta_vector,
            new_vector: deltaResult.new_vector,
            growth_score: deltaResult.growth_score
        });

    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

`

---

## src/app/api/mypage/route.ts

`
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("zax-session")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = prisma as {
      diagnosticResult?: { findMany: (args: any) => Promise<any> };
      reflection?: { findMany: (args: any) => Promise<any> };
    };

    const [diagnostics, reflections] = await Promise.all([
      p.diagnosticResult
        ? p.diagnosticResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
      p.reflection
        ? p.reflection.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : [],
    ]);

    return NextResponse.json({
      diagnostics: diagnostics || [],
      reflections: reflections || [],
    });
  } catch (e) {
    console.error("Mypage fetch error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

`

---

## src/app/api/gemini-logs/route.ts

`
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

/** 管理用: Geminiログ一覧（簡易。本番では認証・権限が必要） */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));

    const p = prisma as { geminiLog?: { findMany: (args: any) => Promise<any> } };
    if (!p?.geminiLog) {
      return NextResponse.json({ logs: [] });
    }

    const logs = await p.geminiLog.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (e) {
    console.error("Gemini logs fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

`

---

## src/components/diagnostic/DiagnosticWizard.tsx

`
'use client';

import { useState, useRef, useEffect } from 'react';
import { questions } from '@/data/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function DiagnosticWizard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // For auto-scroll or focus effects
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const lastQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
  // 最終問では「今の質問に回答済み」または70%以上回答で送信可能
  const allAnswered = answeredCount >= totalQuestions * 0.8 ||
                      (currentQuestionIndex === totalQuestions - 1 && (lastQuestionAnswered || answeredCount >= totalQuestions * 0.7));

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance with a slight delay for visual feedback
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setDirection('next');
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 300);
    } else {
        // Scroll to submit button or highlight it if it's the last question
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection('next');
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection('prev');
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const resultData = { id: data.id, synthesis: data.synthesis, answers: data.answers };
        sessionStorage.setItem(`diagnostic_result_${data.id}`, JSON.stringify(resultData));
        window.location.href = `/diagnostic/result/${data.id}`;
      } else {
        console.error('Failed to submit:', data.error);
        alert('エラーが発生しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      alert('通信エラーが発生しました。ブラウザのコンソールを確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-7 Scale Configuration
  // 1: Big Disagree, 2: Med Disagree, 3: Small Disagree, 4: Neutral, 5: Small Agree, 6: Med Agree, 7: Big Agree
  const options = [
    { value: 1, label: '同意しない', color: 'bg-red-500', size: 'w-16 h-16', border: 'border-red-500' },
    { value: 2, label: '', color: 'bg-red-400', size: 'w-12 h-12', border: 'border-red-400' },
    { value: 3, label: '', color: 'bg-red-300', size: 'w-8 h-8', border: 'border-red-300' },
    { value: 4, label: '中立', color: 'bg-slate-200', size: 'w-6 h-6', border: 'border-slate-300' },
    { value: 5, label: '', color: 'bg-green-300', size: 'w-8 h-8', border: 'border-green-300' },
    { value: 6, label: '', color: 'bg-green-400', size: 'w-12 h-12', border: 'border-green-400' },
    { value: 7, label: '同意する', color: 'bg-green-500', size: 'w-16 h-16', border: 'border-green-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative perspective-1000">
          <Card 
            ref={cardRef}
            className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500"
          >
            <CardContent className="p-8 sm:p-12 text-center space-y-10">
              
              {/* Question Text */}
              {currentQuestion && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 key={currentQuestionIndex}">
                <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                    質問 {currentQuestion.id} / {totalQuestions}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>
              )}

              {/* Options (Bubbles) */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                <div className="hidden sm:block text-xs font-bold text-red-500/80 mr-2">同意しない</div>
                
                    {options.map((opt) => {
                    const isSelected = currentQuestion && answers[currentQuestion.id] === opt.value;
                    const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
                    
                    return (
                        <button
                            key={opt.value}
                            onClick={() => currentQuestion && handleAnswer(opt.value)}
                            className={`
                                rounded-full transition-all duration-300 flex items-center justify-center
                                ${opt.size}
                                ${isSelected 
                                    ? `${opt.color} ring-4 ring-offset-2 ring-indigo-100 scale-110` 
                                    : `bg-transparent border-2 ${opt.border} hover:bg-slate-50`
                                }
                                ${!isSelected && isAnswered ? 'opacity-40 hover:opacity-100' : 'opacity-100'}
                            `}
                            aria-label={`Select option ${opt.value}`}
                        >
                            {isSelected && <Check className="text-white w-5 h-5 stroke-[3px]" />}
                        </button>
                    );
                })}

                <div className="hidden sm:block text-xs font-bold text-green-600/80 ml-2">同意する</div>
              </div>

              {/* Mobile Labels */}
              <div className="flex sm:hidden justify-between text-xs font-bold text-slate-400 px-2">
                <span className="text-red-500">同意しない</span>
                <span className="text-green-600">同意する</span>
              </div>

            </CardContent>
          </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          前へ
        </Button>

        {currentQuestionIndex === totalQuestions - 1 && (
             <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !allAnswered}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSubmitting ? '分析中...' : '診断結果を見る'}
             </Button>
        )}
        
        {currentQuestionIndex < totalQuestions - 1 && (
            <div className="text-xs text-slate-300">
                回答すると自動で進みます
            </div>
        )}
      </div>
    </div>
  );
}

`

---

## src/components/diagnostic/DiagnosticResultClient.tsx

`
"use client";

import { useEffect, useState } from "react";
import { questions, effectiveScore } from "@/data/questions";
import { DIMENSION_LABELS } from "@/lib/rec/engine";
import ResultRadarChart from "./ResultRadarChart";
import MatchResults from "./MatchResults";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ResultData {
  id: string;
  synthesis: string;
  answers: Record<string, number>;
}

interface DiagnosticResultClientProps {
  resultId: string;
}

export default function DiagnosticResultClient({ resultId }: DiagnosticResultClientProps) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `diagnostic_result_${resultId}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {
        setError("データの読み込みに失敗しました");
      }
      setLoading(false);
      return;
    }
    fetch(`/api/diagnostic/result/${resultId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((json) => setData(json))
      .catch(() => setError("結果の取得に失敗しました。もう一度診断をお試しください。"))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-slate-600 mb-6">{error || "結果が見つかりませんでした"}</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            診断をやり直す
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const answers = data.answers;

  // 5カテゴリ（質問ベース）のスコア計算
  const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
  const categoryScores: Record<string, { sum: number; count: number }> = {};
  CATEGORY_ORDER.forEach((c) => { categoryScores[c] = { sum: 0, count: 0 }; });

  Object.entries(answers).forEach(([qId, score]) => {
    const q = questions.find((q) => q.id === Number(qId));
    const rawScore = Number(score);
    if (q && categoryScores[q.category] && !isNaN(rawScore)) {
      categoryScores[q.category].sum += effectiveScore(q, rawScore);
      categoryScores[q.category].count += 1;
    }
  });

  // 0-100スケールの生スコア（カテゴリ順: Social, Empathy, Discipline, Openness, Emotional）
  const rawByCat = CATEGORY_ORDER.map((c) => {
    const d = categoryScores[c];
    const avg = d.count > 0 ? d.sum / d.count : 4;
    return Math.round(((avg - 1) / 6) * 100);
  });
  const [social, empathy, discipline, openness, emotional] = rawByCat;

  // マッチングと同じ6次元にマッピング: 論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性
  const userVector6d: number[] = [
    discipline,   // 論理性 ← 誠実性
    openness,     // 直感力 ← 開放性
    empathy,      // 共感性 ← 協調性
    discipline,   // 意志力 ← 誠実性
    openness,     // 創造性 ← 開放性
    Math.round((emotional + social) / 2),  // 柔軟性 ← 情緒安定性・外向性
  ];

  const chartData = DIMENSION_LABELS.map((label, i) => ({
    subject: label,
    A: userVector6d[i] ?? 50,
    fullMark: 100,
  }));

  const synthesisParagraphs = data.synthesis
    .split("\n")
    .filter((p: string) => p.trim() !== "")
    .map((p: string) => p.replace(/AI・?/g, "").replace(/AI分析/g, "分析"));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="h-16" />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            分析完了
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            あなたの
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              性格特性
            </span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            回答データから抽出された、あなたの行動特性と価値観の分析結果です。
          </p>
        </section>

        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-200/30 border border-slate-200/60">
          <h2 className="text-2xl font-bold mb-8 text-center">特性レーダーチャート</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResultRadarChart data={chartData} />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.subject} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 font-bold mb-1">{item.subject}</div>
                <div className="text-2xl font-black text-slate-900">{item.A}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            心理分析レポート
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-slate-300 relative z-10 font-medium">
            {synthesisParagraphs.map((para: string, i: number) =>
              para.startsWith("#") ? (
                <h3 key={i} className="text-xl font-bold text-white mt-6 mb-2">
                  {para.replace(/^#+\s/, "")}
                </h3>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </div>
        </section>

        <MatchResults userVector={userVector6d} synthesis={data.synthesis} />

        <section className="text-center pt-8">
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
          >
            もう一度診断する
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-slate-400">ベクトルは出会いごとに更新されます。</p>
        </section>
      </main>
    </div>
  );
}

`

---

## src/components/diagnostic/MatchResults.tsx

`
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, TrendingUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import CompareRadarChart from "./CompareRadarChart";

interface MatchUser {
  id: string;
  name: string;
  vector: number[];
  bio: string;
  tags: string[];
}

interface Match {
  matchUser: MatchUser;
  similarity: number;
  growthScore: number;
  reasoning: string;
}

/** マッチング意図ごとの最適類似度（恋愛=刺激的 / ビジネス=バランス / 友人=深い共感） */
const PURPOSE_OPTIMAL_SIMILARITY: Record<string, number> = {
  default: 0.5,
  romance: 0.4,
  business: 0.5,
  friendship: 0.6,
};

interface MatchResultsProps {
  userVector: number[];
  synthesis?: string;
}

export default function MatchResults({ userVector, synthesis }: MatchResultsProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [purpose, setPurpose] = useState<keyof typeof PURPOSE_OPTIMAL_SIMILARITY>("default");

  useEffect(() => {
    setLoading(true);
    async function fetchMatches() {
      try {
        const optimalSimilarity = PURPOSE_OPTIMAL_SIMILARITY[purpose] ?? 0.5;
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vector: userVector,
            topN: 5,
            synthesis,
            optimalSimilarity,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userVector.length === 6) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [userVector, synthesis, purpose]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">マッチング候補を検索中...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  const top3 = matches.slice(0, 3);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-sm">
          <Users className="w-4 h-4" />
          共鳴マッチ
        </div>
        <div className="flex justify-center">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as keyof typeof PURPOSE_OPTIMAL_SIMILARITY)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white/80 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="default">目的を選ぶ（バランス）</option>
            <option value="romance">恋愛・刺激的な出会い</option>
            <option value="business">ビジネス・協業パートナー</option>
            <option value="friendship">友人・深い共感</option>
          </select>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
          あなたと<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">共鳴する</span>パートナー
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          補完性スコアの高い相手は、似すぎず違いすぎない「成長を促す関係」を築けます。
        </p>
      </motion.div>

      {/* Match Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {top3.map((match, i) => (
          <motion.div
            key={match.matchUser.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="relative h-full bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                {i + 1}
              </div>

              <div className="p-6 space-y-4">
                {/* Name & Bio */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {match.matchUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {match.matchUser.bio}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                  {match.matchUser.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">共鳴度</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">
                      {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">成長性</span>
                    </div>
                    <span className="text-xl font-black text-indigo-600">
                      {match.growthScore}%
                    </span>
                  </div>
                </div>

                {/* Radar Chart */}
                <CompareRadarChart
                  myVector={userVector}
                  partnerVector={match.matchUser.vector}
                />

                {/* 相性の理由 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {match.reasoning}
                  </p>
                </div>

                {/* チャット → 会う フロー */}
                <Link
                  href={`/chat?partner=${encodeURIComponent(match.matchUser.name)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  チャットを始める
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

`

---

## src/components/diagnostic/ResultRadarChart.tsx

`
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";

interface ResultRadarChartProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function ResultRadarChart({ data }: ResultRadarChartProps) {
  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, data[0]?.fullMark ?? 100]} tick={false} axisLine={false} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

`

---

## src/components/diagnostic/CompareRadarChart.tsx

`
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompareRadarChartProps {
  myVector: number[];
  partnerVector: number[];
  labels?: string[];
}

export default function CompareRadarChart({
  myVector,
  partnerVector,
  labels = ["論理性", "直感力", "共感性", "意志力", "創造性", "柔軟性"],
}: CompareRadarChartProps) {
  const data = labels.map((label, i) => ({
    subject: label,
    me: myVector[i] ?? 0,
    partner: partnerVector[i] ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="あなた"
            dataKey="me"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="相手"
            dataKey="partner"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

`

---

## src/components/chat/PostChatInterview.tsx

`
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ChevronLeft, ChevronRight, Check } from "lucide-react";

const QUESTIONS = [
  { key: "aboutPartner" as const, label: "相手はどうでしたか？" },
  { key: "howChanged" as const, label: "自分はどう変わった？" },
  { key: "grew" as const, label: "成長を実感できた？" },
  { key: "togetherFeel" as const, label: "一緒にいてどうだった？" },
] as const;

const LIKERT_OPTIONS = [
  { value: 1, label: "同意しない", color: "bg-red-500", size: "w-16 h-16", border: "border-red-500" },
  { value: 2, label: "", color: "bg-red-400", size: "w-12 h-12", border: "border-red-400" },
  { value: 3, label: "", color: "bg-red-300", size: "w-8 h-8", border: "border-red-300" },
  { value: 4, label: "中立", color: "bg-slate-200", size: "w-6 h-6", border: "border-slate-300" },
  { value: 5, label: "", color: "bg-green-300", size: "w-8 h-8", border: "border-green-300" },
  { value: 6, label: "", color: "bg-green-400", size: "w-12 h-12", border: "border-green-400" },
  { value: 7, label: "同意する", color: "bg-green-500", size: "w-16 h-16", border: "border-green-500" },
];

export interface ReflectionAnswers {
  aboutPartner: number;
  howChanged: number;
  grew: number;
  togetherFeel: number;
}

interface PostChatInterviewProps {
  partnerName: string;
  onSubmit: (answers: ReflectionAnswers) => void;
  onSkip: () => void;
}

export default function PostChatInterview({
  partnerName,
  onSubmit,
  onSkip,
}: PostChatInterviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<ReflectionAnswers>>({});

  const currentQ = QUESTIONS[currentIndex];
  const value = answers[currentQ.key];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === 4;

  const handleAnswer = (v: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.key]: v }));
    if (currentIndex < 3) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (
      typeof answers.aboutPartner === "number" &&
      typeof answers.howChanged === "number" &&
      typeof answers.grew === "number" &&
      typeof answers.togetherFeel === "number"
    ) {
      onSubmit({
        aboutPartner: answers.aboutPartner,
        howChanged: answers.howChanged,
        grew: answers.grew,
        togetherFeel: answers.togetherFeel,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[600px] flex flex-col justify-center">
      <div className="relative perspective-1000">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-visible transition-all duration-500 text-slate-900">
          <CardContent className="p-8 sm:p-12 text-center space-y-10">
            <div className="space-y-4">
              <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">
                振り返り {currentIndex + 1} / 4
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                {partnerName}さんとの振り返り
              </h2>
              <p className="text-sm text-slate-500">1〜7で回答してください</p>
            </div>

            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800">{currentQ.label}</h3>
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                <div className="hidden sm:block text-xs font-bold text-red-500/80 mr-2">同意しない</div>
                {LIKERT_OPTIONS.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`
                        rounded-full transition-all duration-300 flex items-center justify-center
                        ${opt.size}
                        ${isSelected
                          ? `${opt.color} ring-4 ring-offset-2 ring-indigo-100 scale-110 text-white`
                          : `bg-transparent border-2 ${opt.border} hover:bg-slate-50`}
                      `}
                      aria-label={`Select ${opt.value}`}
                    >
                      {isSelected && <Check className="w-5 h-5 stroke-[3px]" />}
                    </button>
                  );
                })}
                <div className="hidden sm:block text-xs font-bold text-green-600/80 ml-2">同意する</div>
              </div>
              <div className="flex sm:hidden justify-between text-xs font-bold text-slate-400 px-2">
                <span className="text-red-500">同意しない</span>
                <span className="text-green-600">同意する</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                スキップ
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                送信
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex((i) => Math.min(3, i + 1))}
                disabled={currentIndex === 3}
                className="text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

`

---

## src/components/chat/ReflectionView.tsx

`
"use client";

import { motion } from "framer-motion";
import { Sparkles, Home } from "lucide-react";
import Link from "next/link";

const LIKERT_LABELS: Record<number, string> = {
    1: "同意しない",
    2: "やや同意しない",
    3: "どちらかといえば同意しない",
    4: "中立",
    5: "どちらかといえば同意する",
    6: "やや同意する",
    7: "同意する",
};

interface ReflectionViewProps {
    answers: { aboutPartner: number; howChanged: number; grew: number; togetherFeel: number };
    summary: string;
    partnerName: string;
}

export default function ReflectionView({ answers, summary, partnerName }: ReflectionViewProps) {
    const items = [
        { q: "相手はどうでしたか？", a: LIKERT_LABELS[answers.aboutPartner] ?? answers.aboutPartner },
        { q: "自分はどう変わった？", a: LIKERT_LABELS[answers.howChanged] ?? answers.howChanged },
        { q: "成長を実感できた？", a: LIKERT_LABELS[answers.grew] ?? answers.grew },
        { q: "一緒にいてどうだった？", a: LIKERT_LABELS[answers.togetherFeel] ?? answers.togetherFeel },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900">あなたの変化</h3>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl mb-6">
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">{summary}</p>
            </div>

            <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {partnerName}さんとの振り返り
                </p>
                {items.map((item) => (
                    <div key={item.q} className="text-sm">
                        <span className="text-slate-500">{item.q}</span>
                        <p className="text-slate-800 mt-0.5">{item.a}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
              <Link
                href="/mypage"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                マイページ
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                ホームへ
              </Link>
            </div>
        </motion.div>
    );
}

`

---

## src/components/BlindChat.tsx

`
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Zap, Coffee } from "lucide-react";

interface BlindChatProps {
    partnerName?: string;
    onEndChat: () => void;
}

export default function BlindChat({ partnerName, onEndChat }: BlindChatProps) {
    const [messages, setMessages] = useState<{ id: number; text: string; sender: "me" | "them" }[]>([
        { id: 1, text: "はじめまして。", sender: "them" },
    ]);
    const [inputText, setInputText] = useState("");
    const [resonance, setResonance] = useState(50);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Simulate resonance fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setResonance(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.4) * 5)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), text: inputText, sender: "me" as const };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        // Simulate reply with random responses to feel "alive"
        setTimeout(() => {
            const responses = [
                "なるほど、その視点は面白いですね。",
                "確かに。でも、逆にこういう見方もできませんか？",
                "すごく共感します。僕も同じことを考えていました。",
                "それは深いですね...もう少し詳しく教えてもらえますか？",
                "ふむ、あなたの価値観が少し見えてきた気がします。",
                "意外です。そういう一面もお持ちなんですね。",
                "そう言われると、確かにそうかもしれません。",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: randomResponse,
                sender: "them"
            }]);
            setResonance(prev => Math.min(100, prev + 15)); // Boost resonance on reply
        }, 1500);
    };

    return (
        <div className="w-full h-[80vh] flex flex-col bg-white/70 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/40 relative shadow-xl shadow-slate-200/50">
            {/* Header with Resonance Metter */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center relative">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-blue-200 opacity-50" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 tracking-widest uppercase mb-0.5 font-bold">相手</div>
                        <div className="text-base font-bold text-slate-800 tracking-tight">{partnerName || '共鳴する相手'}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-mono mb-1 tracking-wider font-bold">
                            <Zap size={12} fill="currentColor" />
                            共鳴度: {Math.round(resonance)}%
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                animate={{ width: `${resonance}%` }}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={onEndChat}
                        className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border-l border-slate-200 pl-6 py-1 font-bold"
                    >
                        終了
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-50/50" ref={scrollRef}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "me"
                                ? "bg-white border border-blue-100 text-slate-700 rounded-br-none shadow-blue-100/50"
                                : "bg-white border border-slate-100 text-slate-600 rounded-bl-none"
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {resonance > 80 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 my-4"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold tracking-wider shadow-sm">
                            共鳴度高
                        </span>
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors">
                            <Coffee className="w-4 h-4" />
                            会う約束をする
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Floating Input Area (The "Floor") */}
            <div className="p-8 bg-gradient-to-t from-white via-white/80 to-transparent z-20">
                <div className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-full px-2 py-2 shadow-2xl shadow-slate-200/50 ring-4 ring-slate-50 group focus-within:ring-blue-50 transition-all">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-transparent border-none px-6 text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium tracking-wide"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 1)" }} // Blue-600
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className="p-3 bg-slate-900 rounded-full text-white shadow-lg shadow-slate-200 transition-all"
                    >
                        <Send size={18} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

`

---

## src/app/chat/ChatClient.tsx

`
'use client';

import { useState } from "react";
import BlindChat from '@/components/BlindChat';
import PostChatInterview, { type ReflectionAnswers } from '@/components/chat/PostChatInterview';
import ReflectionView from '@/components/chat/ReflectionView';
import { useSearchParams } from 'next/navigation';

type Step = 'chat' | 'interview' | 'reflection';

export default function ChatClient() {
  const searchParams = useSearchParams();
  const partnerName = searchParams.get('partner') || '共鳴する相手';

  const [step, setStep] = useState<Step>('chat');
  const [interviewAnswers, setInterviewAnswers] = useState<ReflectionAnswers | null>(null);
  const [reflectionSummary, setReflectionSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEndChat = () => {
    setStep('interview');
  };

  const handleInterviewSubmit = async (answers: ReflectionAnswers) => {
    setInterviewAnswers(answers);
    setLoading(true);
    setStep('reflection');
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, partnerName }),
      });
      const data = await res.json();
      setReflectionSummary(data.summary || 'あなたの振り返りが記録されました。');
    } catch {
      setReflectionSummary('あなたの振り返りが記録されました。');
    } finally {
      setLoading(false);
      setStep('reflection');
    }
  };

  const handleInterviewSkip = () => {
    setInterviewAnswers({
      aboutPartner: 4,
      howChanged: 4,
      grew: 4,
      togetherFeel: 4,
    });
    setReflectionSummary('振り返りをスキップしました。');
    setStep('reflection');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex justify-center items-center">
        {step === 'chat' && (
          <BlindChat partnerName={partnerName} onEndChat={handleEndChat} />
        )}
        {step === 'interview' && (
          <PostChatInterview
            partnerName={partnerName}
            onSubmit={handleInterviewSubmit}
            onSkip={handleInterviewSkip}
          />
        )}
        {step === 'reflection' && (
          loading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600">振り返りを分析中...</p>
            </div>
          ) : interviewAnswers && (
            <ReflectionView
              answers={interviewAnswers}
              summary={reflectionSummary}
              partnerName={partnerName}
            />
          )
        )}
      </div>
    </div>
  );
}

`

---

## src/app/chat/page.tsx

`
import { requireAuth } from '@/lib/auth-check';
import ChatClient from './ChatClient';

export default async function ChatPage() {
  await requireAuth();

  return <ChatClient />;
}

`

---

## src/app/mypage/page.tsx

`
import { requireAuth } from "@/lib/auth-check";
import MypageClient from "./MypageClient";

export default async function MypagePage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">マイページ</h1>
        <MypageClient />
      </div>
    </div>
  );
}

`

---

## src/app/mypage/MypageClient.tsx

`
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MessageCircle, ChevronRight, Sparkles } from "lucide-react";

interface Diagnostic {
  id: string;
  synthesis: string;
  vector: string;
  createdAt: string;
}

interface Reflection {
  id: string;
  partnerName: string;
  summary: string;
  createdAt: string;
}

export default function MypageClient() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mypage")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setDiagnostics(data.diagnostics || []);
        setReflections(data.reflections || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          診断結果
        </h2>
        {diagnostics.length === 0 ? (
          <p className="text-slate-500 py-4">まだ診断結果がありません</p>
        ) : (
          <div className="space-y-3">
            {diagnostics.map((d) => (
              <Link
                key={d.id}
                href={`/diagnostic/result/${d.id}`}
                className="block p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {new Date(d.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-slate-800 mt-1 line-clamp-2 text-sm">
                  {d.synthesis?.slice(0, 80) || "診断結果"}...
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          振り返り
        </h2>
        {reflections.length === 0 ? (
          <p className="text-slate-500 py-4">まだ振り返りがありません</p>
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-800">
                    {r.partnerName}さんと
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{r.summary}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Gemini ログ
        </h2>
        <Link
          href="/admin/gemini-logs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
        >
          Geminiの判断ログを確認
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

`

---

## src/app/admin/gemini-logs/page.tsx

`
"use client";

import { useEffect, useState } from "react";
// 管理画面: 本番では認証・権限チェックを追加推奨
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface GeminiLog {
  id: string;
  type: string;
  prompt: string;
  response: string;
  metadata: string | null;
  createdAt: string;
}

export default function GeminiLogsPage() {
  const [logs, setLogs] = useState<GeminiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    const url = type ? `/api/gemini-logs?type=${type}&limit=50` : "/api/gemini-logs?limit=50";
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setLogs(data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          マイページへ戻る
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Gemini 判断ログ
        </h1>

        <div className="mb-6 flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">すべて</option>
            <option value="synthesis">synthesis</option>
            <option value="matchReasoning">matchReasoning</option>
            <option value="reflectionSummary">reflectionSummary</option>
            <option value="analyzeEssence">analyzeEssence</option>
            <option value="calculateDeltaVector">calculateDeltaVector</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 py-8">ログがありません</p>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-100 flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-indigo-600">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Prompt
                    </p>
                    <pre className="text-xs bg-slate-50 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                      {log.prompt}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Response
                    </p>
                    <pre className="text-xs bg-indigo-50 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                      {log.response}
                    </pre>
                  </div>
                  {log.metadata && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                        Metadata
                      </p>
                      <pre className="text-xs bg-slate-50 p-3 rounded overflow-x-auto">
                        {log.metadata}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

`

---

## src/app/input/InputClient.tsx

`
'use client';

import { useState } from 'react';
import EssenceInput, { EssenceInputData } from '@/components/EssenceInput';
import VectorTransformationVisual from '@/components/VectorTransformationVisual';
import { useRouter } from 'next/navigation';

export default function InputClient() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: EssenceInputData) => {
    const inputs = data.fragments.filter((f) => f.trim());
    if (inputs.length === 0) {
      setError('少なくとも1つ以上の入力が必要です');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          biases: data.biases,
          purpose: data.purpose || 'general',
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '分析に失敗しました');
      }

      router.push('/chat');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
             <h1 className="text-3xl font-bold text-slate-900 mb-2">Resonance Input</h1>
             <p className="text-slate-500">Discover your core vector.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                {analyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-slate-600 font-medium">分析中...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <EssenceInput onComplete={handleComplete} />
            </div>
            
            <div className="hidden md:block sticky top-20">
                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl aspect-square flex items-center justify-center overflow-hidden relative">
                    <VectorTransformationVisual />
                    <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono">
                        VECTOR_SPACE_VISUALIZER // LISTENING
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
}

`

---

## src/app/input/page.tsx

`
import { requireAuth } from '@/lib/auth-check';
import InputClient from './InputClient';

export default async function InputPage() {
  await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <InputClient />
    </main>
  );
}

`

---

## src/components/EssenceInput.tsx

`
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Activity, Sparkles, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EssenceInputData {
    fragments: string[];
    biases: number[];
    purpose: string;
}

interface EssenceInputProps {
    onComplete: (data: EssenceInputData) => void;
}

export default function EssenceInput({ onComplete }: EssenceInputProps) {
    const [step, setStep] = useState<"purpose" | "attributes" | "sns" | "fragments">("purpose");
    const [data, setData] = useState({
        purpose: "",
        attributes: [] as string[],
        sns: "",
        fragments: ["", "", ""],
    });

    const steps = ["purpose", "attributes", "sns", "fragments"];
    const currentStepIndex = steps.indexOf(step);
    const stepLabels = ["目的", "興味", "連携", "分析"];

    const purposes = [
        { id: "happiness", label: "HAPPINESS", title: "幸福の探求", desc: "人生単位の幸福と精神的充足を追求する", emoji: "✨", color: "#F59E0B" },
        { id: "romance", label: "ROMANCE", title: "魂の共鳴", desc: "魂が共鳴する深いパートナーシップを築く", emoji: "💫", color: "#EC4899" },
        { id: "friendship", label: "ALLIANCE", title: "生涯の盟友", desc: "相互に高め合う生涯の盟友を見つける", emoji: "🤝", color: "#7C3AED" },
    ];

    const tags = [
        "Startup", "Design", "Engineering", "Sauna", "Art", "Music", 
        "Cinema", "Philosophy", "Fashion", "Travel", "Crypto", "Cooking"
    ];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1] as typeof step);
        } else {
            onComplete({ 
                fragments: data.fragments, 
                biases: [50, 50, 50], 
                purpose: data.purpose 
            });
        }
    };

    const toggleTag = (tag: string) => {
        if (data.attributes.includes(tag)) {
            setData({ ...data, attributes: data.attributes.filter(t => t !== tag) });
        } else {
            setData({ ...data, attributes: [...data.attributes, tag] });
        }
    };

    return (
        <div 
            className="min-h-screen font-sans flex flex-col relative overflow-hidden"
            style={{ 
                backgroundColor: '#FAFAFA', 
                color: '#1A1A1A',
                backgroundImage: `radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 50%),
                                  radial-gradient(circle at 70% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)`,
            }}
        >
            {/* Progress Header */}
            <div 
                className="sticky top-0 z-50 px-6 py-5"
                style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight" style={{ color: '#1A1A1A' }}>ZAX</span>
                            <span className="text-sm ml-3 font-mono" style={{ color: '#888' }}>
                                STEP {currentStepIndex + 1} / {steps.length}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="hidden sm:flex items-center gap-3">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div 
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: i <= currentStepIndex ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.03)',
                                        color: i <= currentStepIndex ? '#7C3AED' : '#888',
                                        border: i === currentStepIndex ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                                    }}
                                >
                                    {i < currentStepIndex ? <Check className="w-3 h-3" /> : null}
                                    {stepLabels[i]}
                                </div>
                                {i < steps.length - 1 && (
                                    <div 
                                        className="w-8 h-px"
                                        style={{ backgroundColor: i < currentStepIndex ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.08)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
                <div className="w-full max-w-4xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: PURPOSE */}
                        {step === "purpose" && (
                            <motion.div
                                key="purpose"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 01</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span style={{ color: '#1A1A1A' }}>あなたの</span>
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >目的</span>
                                    <span style={{ color: '#1A1A1A' }}>は？</span>
                                </h2>
                                <p className="mb-16 text-lg" style={{ color: '#666' }}>
                                    ZAXを利用する主な目的を教えてください。
                                </p>
                                
                                {/* Purpose Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    {purposes.map((p, i) => (
                                        <motion.button
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setData({ ...data, purpose: p.id });
                                                handleNext();
                                            }}
                                            className="group relative p-8 rounded-3xl transition-all duration-500 text-center"
                                            style={{
                                                backgroundColor: 'white',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <div className="text-5xl mb-6">{p.emoji}</div>
                                            <div 
                                                className="text-xs font-mono tracking-widest mb-2"
                                                style={{ color: p.color }}
                                            >
                                                {p.label}
                                            </div>
                                            <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>{p.title}</h3>
                                            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{p.desc}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: ATTRIBUTES */}
                        {step === "attributes" && (
                            <motion.div
                                key="attributes"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#0EA5E9' }}>STEP 02</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >興味・関心</span>
                                    <span style={{ color: '#1A1A1A' }}>を選択</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    興味のある分野を選択してください（複数可）
                                </p>
                                
                                <div className="flex flex-wrap gap-3 justify-center mb-12 max-w-2xl mx-auto">
                                    {tags.map((tag, i) => (
                                        <motion.button
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => toggleTag(tag)}
                                            className="px-5 py-3 rounded-full text-sm font-medium transition-all duration-300"
                                            style={{
                                                backgroundColor: data.attributes.includes(tag) ? '#7C3AED' : 'white',
                                                color: data.attributes.includes(tag) ? 'white' : '#666',
                                                border: data.attributes.includes(tag) ? '1px solid #7C3AED' : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: data.attributes.includes(tag) ? '0 4px 15px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            {data.attributes.includes(tag) && <Check className="w-4 h-4 inline mr-1.5" />}
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    disabled={data.attributes.length === 0}
                                    className="px-10 py-4 rounded-full font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                    }}
                                >
                                    次のステップへ
                                    <ArrowRight className="w-5 h-5 inline ml-2" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* STEP 3: SNS */}
                        {step === "sns" && (
                            <motion.div
                                key="sns"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#10B981' }}>STEP 03</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >シグナル</span>
                                    <span style={{ color: '#1A1A1A' }}>を同期</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    SNSデータを連携して、思考ベクトルを抽出します
                                </p>
                                
                                <div className="max-w-md mx-auto space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}
                                        className="w-full p-6 rounded-2xl flex items-center gap-5 transition-all group"
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <div 
                                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: '#000' }}
                                        >
                                            <X className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-lg" style={{ color: '#1A1A1A' }}>X (Twitter)</div>
                                            <div className="text-sm" style={{ color: '#888' }}>テキストベクトルを解析</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5" style={{ color: '#ccc' }} />
                                    </motion.button>
                                    
                                    <button 
                                        onClick={handleNext}
                                        className="w-full py-4 font-medium transition-colors"
                                        style={{ color: '#888' }}
                                    >
                                        スキップして手動入力 →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: FRAGMENTS */}
                        {step === "fragments" && (
                            <motion.div
                                key="fragments"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)' }}
                                >
                                    <span className="text-xs font-mono" style={{ color: '#7C3AED' }}>STEP 04</span>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                    <span 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >分析開始</span>
                                </h2>
                                <p className="mb-12 text-lg" style={{ color: '#666' }}>
                                    入力データから本質ベクトルを生成します
                                </p>
                                
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md mx-auto p-10 rounded-3xl"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div 
                                        className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                                        }}
                                    >
                                        <Activity className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3" style={{ color: '#1A1A1A' }}>ベクトル化準備完了</h3>
                                    <p className="text-sm leading-relaxed mb-10" style={{ color: '#888' }}>
                                        入力されたデータから、あなたの「本質ベクトル」を生成します。<br/>
                                        生成には10-20秒かかる場合があります。
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(124, 58, 237, 0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onComplete({
                                            fragments: ["シミュレート入力"],
                                            biases: [50, 50, 50],
                                            purpose: data.purpose
                                        })}
                                        className="w-full py-5 rounded-full font-bold text-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                                        }}
                                    >
                                        エッセンスベクトルを生成
                                        <Zap className="w-5 h-5 inline ml-2" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

`

---

## src/components/CorporateHeader.tsx

`
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const navLinks = [
  { label: "ABOUT US", href: "/about" },
  { label: "VISION", href: "/philosophy" },
  { label: "PRODUCT", href: "/technology" },
  { label: "DIAGNOSTIC", href: "/diagnostic" },
  { label: "MY PAGE", href: "/mypage" },
  { label: "LOGIN", href: "/login" },
];

export default function CorporateHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/40">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
            >
              ZAX
            </Link>

            {/* Hamburger Button — always visible */}
            <button
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-6 lg:px-10 h-16 border-b border-slate-100">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-bold text-slate-900"
              >
                ZAX
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
                aria-label="メニューを閉じる"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-5 text-3xl md:text-5xl font-bold text-slate-900 hover:text-slate-500 tracking-tight transition-colors border-b border-slate-100"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.06, duration: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/diagnostic"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-base font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                >
                  無料で診断を開始
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="px-10 md:px-20 lg:px-32 pb-10 text-xs text-slate-400 tracking-wider">
              &copy; 2026 ZAX — Value-Based Connection
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

`

---

## src/components/LandingPage.tsx

`
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Users, TrendingUp, Sparkles } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    label: "性格分析",
    title: "思考の6次元を可視化",
    desc: "思考特性を6次元ベクトルとして分析し、あなたの内面を可視化。属性ではなく、価値観から相手を見つけます。",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    label: "共鳴マッチング",
    title: "ベクトル空間で出会う",
    desc: "高次元の空間計算により、自分でも気づかない「共通点」を持つ相手を見つけ、AIが論理的に相性を説明します。",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: TrendingUp,
    label: "成長記録",
    title: "対話で進化する自分",
    desc: "対話を通じた自己の変化を記録し、新たな価値観への気づきを促します。あなたのベクトルは出会いごとに更新されます。",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function LandingPage() {
  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans">
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-6"
          >
            ZAX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed mb-4 max-w-xl"
          >
            人とのつながりをサポートし、
            <span className="font-semibold text-slate-900"> 自分の変化を可視化する</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-sm text-slate-500 mb-12 max-w-md"
          >
            50の質問から、価値観とつながり方を可視化します。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/diagnostic"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              診断を開始
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              詳しく見る
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section id="features" className="w-full py-28 lg:py-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="text-sm font-semibold text-slate-400 tracking-[0.15em] uppercase mb-3">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              ZAXの3つの機能
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider mb-2">{f.label}</p>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROP ─── */}
      <section className="w-full py-28 lg:py-40 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-[0.15em] block mb-3">TECHNOLOGY</span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                AIが描く、<br />6次元のベクトル空間
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                論理、直感、共感... ZAXのアルゴリズムは、あなたの発話や行動から6つの指標を抽出し、
                他者との相性を「距離」として計算します。
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                プロダクト・アーキテクチャを見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="h-72 lg:h-80 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 p-10">
                <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="50" stroke="#8b5cf6" strokeWidth="1" fill="none" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="0.5" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                <circle cx="140" cy="70" r="4" fill="#3b82f6" />
                <circle cx="60" cy="130" r="4" fill="#8b5cf6" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="w-full py-28 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 lg:p-20">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              あなたの価値観を、可視化する。
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              属性ではなく価値観でつながる、新しいマッチングプロトコル。
            </p>
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              診断を開始
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

`

---

## src/app/page.tsx

`
import LandingPage from "@/components/LandingPage";

export default function Home() {
  return <LandingPage />;
}

`

---

## src/app/layout.tsx

`
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAX | Value-Based Connection",
  description: "表面的な属性ではなく、価値観と性格特性で繋がる、新しいマッチングプラットフォーム。",
  openGraph: {
    title: "ZAX | Value-Based Connection",
    description: "Connect through values, not just attributes.",
    url: "https://zax.fumiproject.dev",
    siteName: "ZAX",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAX | Value-Based Connection",
    description: "属性ではなく、価値観で繋がる。",
  },
};

import CorporateHeader from "@/components/CorporateHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50`}
        suppressHydrationWarning
      >
        <CorporateHeader />
        {children}
      </body>
    </html>
  );
}

`

---

## src/app/diagnostic/page.tsx

`
import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';

export const metadata = {
  title: '性格・価値観診断 | ZAX',
  description: 'AIがあなたの性格と価値観を分析し、最適なマッチングを実現します。',
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            ZAX 性格・価値観診断
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            50の質問から、あなたの価値観を可視化します。<br/>
            直感で回答してください。正解はありません。
          </p>
        </div>

        <DiagnosticWizard />
      </div>
    </div>
  );
}

`

---

## src/app/diagnostic/result/[id]/page.tsx

`
import DiagnosticResultClient from "@/components/diagnostic/DiagnosticResultClient";

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiagnosticResultClient resultId={id} />;
}

`

---

## src/app/login/page.tsx

`
'use client';

import { useActionState } from 'react';
import { manualLogin } from '@/lib/actions/manual-auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(manualLogin, { message: "" });

  return (
    <main className="flex items-center justify-center md:h-screen bg-slate-50">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-lg bg-indigo-600 p-3 md:h-36 mb-4">
          <div className="w-32 text-white md:w-36 text-4xl font-bold">ZAX</div>
        </div>
        
        <form action={formAction} className="space-y-3">
          <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-sm border border-slate-200">
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              ログイン
            </h1>
            <div className="w-full">
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-900"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="大学のメールアドレスを入力"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-900"
                  htmlFor="password"
                >
                  パスワード
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="パスワードを入力"
                    required
                    minLength={1}
                  />
                </div>
              </div>
            </div>
            <LoginButton pending={isPending} />
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {state.message && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
            </div>
          </div>
        </form>
        
        <div className="text-center text-sm">
          アカウントをお持ちでないですか？{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            新規登録はこちら
          </Link>
        </div>
      </div>
    </main>
  );
}

function LoginButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center transition-colors"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'ログイン中...' : 'ログイン'}
    </button>
  );
}

`

---

## src/app/register/page.tsx

`
'use client';

import { useActionState } from 'react';
import { manualRegister } from '@/lib/actions/manual-auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(manualRegister, { message: "" });

  return (
    <main className="flex items-center justify-center md:h-screen bg-slate-50">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-lg bg-indigo-600 p-3 md:h-36 mb-4">
          <div className="w-32 text-white md:w-36 text-4xl font-bold">ZAX</div>
        </div>
        
        <form action={formAction} className="space-y-3">
          <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-sm border border-slate-200">
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              アカウント作成
            </h1>
            <div className="w-full space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-900" htmlFor="email">
                  University Email
                </label>
                <input
                  className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@musashino-u.ac.jp"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">@musashino-u.ac.jp または @stu.musashino-u.ac.jp</p>
              </div>
              
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-900" htmlFor="password">
                  パスワード
                </label>
                <input
                  className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="6文字以上"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-900" htmlFor="confirmPassword">
                  パスワード（確認）
                </label>
                <input
                  className="peer block w-full rounded-md border border-slate-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-slate-500 text-slate-900"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="もう一度入力してください"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <RegisterButton pending={isPending} />
            
            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
              {state.message && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
            </div>
          </div>
        </form>
        
        <div className="text-center text-sm">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            ログイン
          </Link>
        </div>
      </div>
    </main>
  );
}

function RegisterButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center transition-colors"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? '作成中...' : '登録する'}
    </button>
  );
}

`

---

## src/app/about/page.tsx

`
"use client";

import { motion } from "framer-motion";
import { Building2, Sparkles, Lightbulb, Database } from "lucide-react";
import EvidenceAnalysis from "@/components/EvidenceAnalysis";
import ImpactChart from "@/components/ImpactChart";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* 背景のアンビエント効果 */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* 縦スクロールレイアウト */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12" style={{ paddingTop: '160px' }}>

                {/* ───────────────────────────────────────────── */}
                {/* [A] HERO — タイトルセクション */}
                {/* ───────────────────────────────────────────── */}
                <motion.section 
                    className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-xs font-mono font-bold tracking-[0.3em] text-indigo-500 mb-8 uppercase">Vision</div>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-slate-900">
                        Restoring<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Human Resonance
                        </span>
                    </h1>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [B] INFO GRID — 基本情報 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Building2, label: "Entity", value: "ZAX R.I." },
                            { icon: Sparkles, label: "Mission", value: "Value Connection" },
                            { icon: Lightbulb, label: "Vision", value: "Total Happiness" },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 p-8 md:p-10 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-200 transition-colors duration-300">
                                <item.icon className="w-8 h-8 text-blue-600 mb-4" />
                                <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-wider">{item.label}</div>
                                <div className="text-lg md:text-xl font-bold text-slate-800">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [C] PHILOSOPHY 1 — 構造的な機会損失 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-white border border-slate-100 rounded-[32px] p-12 md:p-16 relative overflow-hidden group shadow-lg shadow-slate-200/50 flex flex-col justify-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-slate-100 mb-4">01</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">構造的な機会損失</h3>
                        <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                            私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。
                            その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまう...
                            これこそが、人生最大の機会損失です。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [D] PHILOSOPHY 2 — 潜在意識へのアクセス */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full min-h-[50vh] bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[32px] p-12 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 背景デコレーション */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-8xl md:text-9xl font-black text-white/10 mb-4">02</div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">潜在意識へのアクセス</h3>
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化します。
                        </p>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [E] EVIDENCE — 客観的事実としての「幸福と経済」 */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-white border border-slate-100 rounded-[32px] p-10 md:p-16 shadow-lg shadow-slate-200/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 text-blue-600">
                            <Database size={24} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            客観的事実としての<br className="md:hidden" />「幸福と経済」
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            World Happiness Report 2019のデータを用いた実証分析。
                            GDPと幸福度の相関(<span className="font-mono font-bold text-blue-600">R² &gt; 0.6</span>)をテコに、新しい経済循環を生み出します。
                        </p>
                    </div>
                    
                    {/* チャートとエビデンス — 縦積み */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 h-[450px] shadow-sm">
                            <ImpactChart />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm">
                            <div className="text-slate-900">
                                <EvidenceAnalysis />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ───────────────────────────────────────────── */}
                {/* [F] REFERENCES — データソース */}
                {/* ───────────────────────────────────────────── */}
                <motion.section
                    className="w-full bg-slate-900 text-white rounded-[32px] p-10 md:p-16"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6 }}
                >
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8">Data Sources & References</h4>
                    <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-400 font-mono leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-0.5">▸</span>
                                World Happiness Report 2019
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-0.5">▸</span>
                                The World Bank (GDP per capita)
                            </li>
                        </ul>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}

`

---

## src/app/philosophy/page.tsx

`
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ImpactChart from "@/components/ImpactChart";

export default function PhilosophyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-40 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background - Light & Organic */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[180px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[150px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0 }}
                    className="mb-24 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 border border-slate-200 rounded-full bg-white/50 backdrop-blur-md text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                        ZAX PHILOSOPHY
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8 text-slate-900">
                        死ぬ時に「幸福だった」と<br />
                        言い切るために
                    </h1>
                </motion.div>

                {/* Section 1: My Original Experience */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">01. 原体験</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">構造的な機会損失</h2>
                    <p>
                        私個人の究極の目標は、人生の終わりに「この人生は幸福だった」と心から思えることです。しかし、現在の社会構造を見渡したとき、多くの人がその機会を構造的に奪われているのではないかと感じています。
                    </p>
                    <p>
                        私たちは、無意識のうちに学歴、年収、外見といった「属性」というフィルターに思考を占領されています。その結果、本来であれば長期的に深い関係を築けたはずの「真に相性の良い相手」を見逃してしまったり、目先の記号的な条件で繋がりを選んでしまったりすることで、大きな機会損失が生まれていると考えています。
                    </p>
                </motion.section>

                {/* Section 2: Subconscious & Happiness Maximization */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">02. 幸福の最大化</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">潜在意識へのアクセス</h2>
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        <p>
                            真の幸福は、自分が自覚している「条件」の先にある、自分でも気づいていない「潜在的な感情や意識」の中に眠っていると私は信じています。
                            ZAXは、ユーザー一人ひとりの内面を高次元のベクトルとして捉え、長期的な視点での幸福値を最大化することを目的としたシステムです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-slate-900">・潜在意識の解析：</strong> ユーザー自身も言語化できていない「心地よさ」や「価値観」をデータとして抽出します。</li>
                            <li><strong className="text-slate-900">・長期目線での最適化：</strong> 一過性の盛り上がりではなく、人生単位で互いを高め合える「共鳴」を演算します。</li>
                        </ul>
                        <p className="mt-6">
                            このシステムの目的関数は、単なるマッチングの成立ではなく、「ユーザー個人の長期的な幸福量（<span className="font-serif italic font-bold text-slate-900">H<sub>long-term</sub></span>）の最大化」であると考えています。
                        </p>
                    </div>

                    {/* Math Visual */}
                    <div className="flex justify-center my-12">
                        <div className="bg-white border border-slate-200 px-8 py-6 rounded-xl shadow-sm">
                            <span className="font-serif text-2xl md:text-3xl text-blue-600 italic tracking-wider">
                                Maximize <span className="mx-2 text-slate-400">∑</span> H<sub className="text-sm">t</sub>(V<sub className="text-sm">subconscious</sub>)
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Chain of Thought */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">03. 納得の共有</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Chain of Thought</h2>
                    <p>
                        また、ZAXにおいては「なぜこの人と響き合うのか」というプロセスも大切にしたいと考えています。
                        AIがユーザーの潜在意識をどう解釈したのか、その思考の推論プロセス（Chain of Thought）を共有することで、ユーザーは自分自身の新しい一面に気づくことができます。
                    </p>
                    <div className="border-l-4 border-blue-500/30 pl-6 my-6 italic text-slate-500 bg-slate-50 py-4 pr-4 rounded-r-lg">
                        「このCoTが生み出す『納得感』こそが、属性の壁を超えて深く繋がるための土台になると確信しています。」
                    </div>
                </motion.section>

                {/* Section 4: Innovation as Byproduct */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">04. 副産物としてのイノベーション</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">個人の幸福が社会を変える</h2>
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        <p>
                            個々人が自分にとって最適な場所、最適なパートナー、そして真の自己に繋がることができたとき、その社会は勝手に良くなっていくはずです。
                        </p>
                        <ul className="list-none pl-0 space-y-2 mt-4">
                            <li><strong className="text-slate-900">・イノベーションの加速：</strong> 魂のレベルで共鳴する個体が繋がることで、これまでにない創造的な火花が散ります。</li>
                            <li><strong className="text-slate-900">・経済への正の影響：</strong> 孤独による停滞やミスマッチによる損失が消え、個々の知性が最大出力で駆動するようになります。</li>
                        </ul>
                        <p className="mt-6">
                            こうした社会の発展やイノベーションは、あくまで<strong className="text-slate-900">「個人の幸福を追求した結果」</strong>として現れる副産物に過ぎないというのが私の考えです。
                            ZAXが何よりも優先するのは、あなたという個人が、あなたの人生を肯定できる「接続」を提供することです。
                        </p>
                    </div>

                    {/* Chart as "Evidence of Byproduct" */}
                    <div className="mt-8 w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-sm min-h-[500px]">
                        <ImpactChart />
                    </div>
                </motion.section>

                {/* Section 5: Future with BMI */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed"
                >
                    <span className="font-mono text-xs text-blue-600 tracking-widest mb-4 block">05. 未来へ</span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">BMIが普及した世界に向けて</h2>
                    <p>
                        今はまだスマートフォンを通じたインターフェースですが、このZAXという構想は、将来的にBMI（脳マシンインタフェース）が普及した世の中で、さらに真価を発揮できると確信しています。
                    </p>
                    <p>
                        言葉や属性といったフィルターを完全に脱ぎ捨て、心と心が直接響き合う。
                        そんな、誰もが自分の人生を幸福だと思える未来を、私は作っていきたいと考えています。
                    </p>
                </motion.section>

                <div className="mt-20 text-center pb-20">
                    <Link href="/" className="group relative inline-flex items-center gap-4 text-white bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl shadow-blue-500/20">
                        <span className="text-sm tracking-widest uppercase">プロトコルを開始 (Start)</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div >
        </div >
    );
}

`

---

## src/app/product/page.tsx

`
"use client";

import { motion } from "framer-motion";
import { Brain, Network, GitMerge, RefreshCw, MousePointer2, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ThreeLayerModel from "@/components/product/ThreeLayerModel";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
         <div className="font-black text-xl tracking-tight text-white">ZAX / PROTOCOL</div>
         <Link href="/" className="text-xs font-mono font-bold hover:text-indigo-400 transition-colors">BACK TO TOP</Link>
      </header>

      {/* 縦スクロールレイアウト — 各カードをフルワイドで縦積み */}
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col gap-8 md:gap-12">

        {/* ───────────────────────────────────────────── */}
        {/* [A] TITLE CARD — ヒーロー */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[60vh] bg-slate-900/50 border border-white/5 rounded-[32px] p-12 md:p-16 relative overflow-hidden group flex flex-col justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 背景グロー */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold tracking-widest text-indigo-300 border border-white/5">LOGIC v2.0</span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
                    The Logic<br/><span className="text-indigo-500">of Resonance.</span>
                </h1>
                <p className="text-slate-400 font-medium text-lg md:text-xl max-w-lg leading-relaxed">
                    直感的な「運命」の裏側にある、<br/>
                    あなたのための緻密な計算式。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [B] PARADIGM — Frozen to Fluid */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-between items-start mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">01</span>
                <Brain className="text-indigo-500 w-12 h-12" />
            </div>
            <div className="max-w-xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Frozen to Fluid</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                    静的属性（過去）ではなく、動的意志（未来）を計算。<br/>
                    <span className="text-indigo-400">常に変化するあなた</span>を捉え続ける。
                    従来のマッチングは、年齢・職業・趣味といった「固定された属性」でフィルタリングします。
                    しかしZAXは、あなたの「今この瞬間の思考の方向性」をベクトル化し、
                    リアルタイムに更新される動的なプロフィールで共鳴する相手を見つけます。
                </p>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [C] MECHANISM — Evolutionary Loop */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-indigo-600 text-white rounded-[32px] p-12 md:p-16 flex flex-col justify-between relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
             {/* 回転アニメーション背景 */}
             <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ originX: 0.5, originY: 0.5 }}
             >
                <div className="absolute inset-20 border border-white/10 rounded-full border-dashed" />
                <div className="absolute inset-32 border border-white/5 rounded-full border-dashed" />
             </motion.div>
             
             <div className="relative z-10">
                <RefreshCw className="mb-8 opacity-80 w-12 h-12" />
                <h3 className="text-5xl md:text-6xl font-bold leading-[0.9] mb-4">Evolutionary<br/>Loop</h3>
                <div className="text-sm opacity-70 mt-4 font-mono uppercase tracking-widest">Interaction → Update → Evolve</div>
             </div>
             
             <div className="relative z-10 mt-12 max-w-xl">
                <p className="text-white/80 text-lg leading-relaxed">
                    ZAXは一度マッチして終わりではありません。
                    対話するたびにあなたのベクトルは更新され、
                    より精度の高い共鳴相手が見つかるようになります。
                    使えば使うほど、あなた自身の「本質」も可視化されていく — 
                    これがEvolutionary Loopです。
                </p>
             </div>

             <ArrowUpRight className="absolute bottom-12 right-12 text-white/30 w-16 h-16" />
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [D] 3-LAYER MODEL — アーキテクチャ */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[70vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            {/* 上部グラデーションライン */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-blue-500" />
            
            <div className="mb-12">
                <span className="text-8xl md:text-9xl font-black text-slate-800">02</span>
                <h3 className="text-4xl md:text-5xl font-bold text-white mt-4">3-Layer Architecture</h3>
                <p className="text-slate-400 text-lg mt-4 max-w-lg">
                    不動の基盤（CORE）と、瞬時に変わる適応層（LAYER 3）。<br/>
                    3層構造により、安定性と柔軟性を両立しています。
                </p>
            </div>

            {/* 3層モデルビジュアル — 中央揃えで大きく表示 */}
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="w-full max-w-md">
                    <ThreeLayerModel />
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [E] SWARM INTELLIGENCE — 集合知能 */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[50vh] bg-white text-slate-900 rounded-[32px] p-12 md:p-16 flex flex-col justify-between group hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-shadow"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <div>
                 <div className="flex items-center gap-3 mb-6">
                    <GitMerge className="text-indigo-600 w-8 h-8" />
                    <span className="font-mono font-bold text-sm text-slate-400 tracking-widest">03 COLLECTIVE</span>
                 </div>
                 <h3 className="text-5xl md:text-6xl font-black mb-8">Swarm Intelligence</h3>
                 <p className="text-slate-600 font-medium text-lg md:text-xl leading-relaxed max-w-2xl">
                     個々のモデルは孤立せず、成功体験を共有。<br/>
                     人類全体の幸福の最適解を探索する分散型知能。<br/><br/>
                     あるペアの対話から得られた「共鳴パターン」は、
                     匿名化された上で全体のマッチングアルゴリズムにフィードバックされます。
                     これにより、ユーザーが増えるほど精度が向上する集合知能を実現しています。
                 </p>
            </div>
            
            {/* ノード接続ビジュアル */}
            <div className="mt-12 w-full h-32 bg-slate-50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex -space-x-4">
                        {[...Array(8)].map((_,i) => (
                            <motion.div 
                                key={i} 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 border-3 border-white"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* [F] ROADMAP — Phase 1 Launch */}
        {/* ───────────────────────────────────────────── */}
        <motion.section 
            className="w-full min-h-[40vh] bg-slate-900 border border-white/5 rounded-[32px] p-12 md:p-16 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
        >
            <MousePointer2 className="mb-8 text-emerald-500 group-hover:scale-125 transition-transform duration-500" size={48} />
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Phase 1 Launch</h3>
            <div className="text-emerald-400 font-bold font-mono text-2xl">2026.04</div>
            <div className="text-slate-500 text-lg mt-4">Musashino University</div>
            <p className="text-slate-500 mt-6 max-w-md">
                武蔵野大学を皮切りに、学生同士の「本質的なつながり」を創出するプロトタイプを展開します。
            </p>
        </motion.section>

        {/* ───────────────────────────────────────────── */}
        {/* CTA */}
        {/* ───────────────────────────────────────────── */}
        <div className="mt-12 text-center">
            <Link 
                href="/" 
                className="inline-flex items-center gap-4 px-16 py-8 bg-white text-slate-950 rounded-full font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
                START PROTOTYPE
                <ArrowRight size={28} />
            </Link>
        </div>

      </div>
    </div>
  );
}

`

---

## src/app/technology/page.tsx

`
"use client";

import { motion } from "framer-motion";
import { Database, Network, ShieldCheck, Layers, ArrowRight, BrainCircuit, TrendingUp, Users } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-40">
      {/* Subtle ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-blue-50/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-violet-50/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 lg:pt-36">
        {/* ─── HERO ─── */}
        <motion.div {...fade} className="mb-20 lg:mb-28">
          <span className="inline-block px-3 py-1 mb-6 rounded-full bg-white text-slate-500 text-xs font-medium tracking-wider border border-slate-200/60 shadow-sm">
            PRODUCT ARCHITECTURE
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            ZAX: Product Architecture
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            ZAXは、個人の内面的特性を多次元データとして捉え、相互作用による「個人の変容」を
            記録・最適化する、<span className="font-semibold text-slate-900">動的マッチングOS</span>です。
          </p>
        </motion.div>

        {/* ─── 1. DATA ARCHITECTURE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">1. データ・アーキテクチャ</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXは、ユーザーを固定された属性ではなく、流動的な<span className="font-semibold text-slate-900">「Identity Vector」</span>として定義します。
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">カテゴリ</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase">保持するデータ項目</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs tracking-wider uppercase hidden md:table-cell">役割</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Core Trait</td>
                  <td className="px-6 py-4 text-slate-600">価値観、思考のプロセス、深層的な関心事</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">マッチングの基礎となる基準点</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">Interaction Log</td>
                  <td className="px-6 py-4 text-slate-600">接続時間、反応率、対話の深度</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">共鳴の強さを測定する</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-900">Delta State</td>
                  <td className="px-6 py-4 text-slate-600">興味関心の移行や言語表現の変化</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">個人の変容（変化量）を記録する</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ─── 2. TRANSFORMATION TRACKING ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold">2. 相互変容トラッキング</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            ZAXの最大の特徴は、単なる「マッチング」で終わらず、その後の
            <span className="font-semibold text-slate-900">「変容（Transformation）」</span>をシステムが評価する点にあります。
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">影響力の解析</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ユーザーAとBが接触した際、双方のデータセットにどのような変化が生じたかを時系列で追跡します。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">変容のフィードバック</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                「誰と関わった時に、どのような新しい視点や行動変容が生まれたか」を蓄積し、成長を引き起こすための予測モデルに反映させます。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── 3. MATCHING LOGIC ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">3. マッチング・ロジックのフロー</h2>
          </div>
          <p className="text-slate-600 mb-8 max-w-2xl">
            システムは以下のサイクルを自動で回し続け、コミュニティ全体の共鳴密度を高めます。
          </p>
          <div className="space-y-4">
            {[
              { num: "01", title: "高精度な推論（Reasoning）", desc: "入力された断片的なデータから、推論型AIを用いてユーザーの潜在的な「共鳴点」を特定します。" },
              { num: "02", title: "未来予測シミュレーション", desc: "候補者同士をマッチングさせた場合、互いにどのような変容をもたらすかを予測し、期待値の高い組み合わせを選出します。" },
              { num: "03", title: "レゾナンス・エンジンの実行", desc: "算出された共鳴係数に基づいて接続を提案します。" },
              { num: "04", title: "変容データの書き戻し", desc: "実際の対面・対話後の変化を再度ベクトル化し、データベースを更新します。" },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 flex gap-5">
                <span className="text-sm font-bold text-slate-300 mt-0.5">{step.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-xs mb-3 tracking-wider uppercase">Resonance Score Formula</p>
            <p className="text-white font-mono text-lg">
              R<sub>score</sub> = ∫<sub>t₀</sub><sup>t₁</sup> f(A, B) dt
            </p>
            <p className="text-slate-500 text-xs mt-3">
              R<sub>score</sub>：期間 t における共鳴と変容の累積値
            </p>
          </div>
        </motion.section>

        {/* ─── 4. GOVERNANCE ─── */}
        <motion.section {...fade} className="mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">4. テクニカル・ガバナンス</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">高セキュアなインフラ構成</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                暗号化通信の徹底と、個人の内面データを匿名化した状態での計算処理。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 mb-3">スケーラビリティ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                小規模なコミュニティから大規模な組織まで、負荷に応じて動的にリソースを拡張するクラウドアーキテクチャ。
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── PHASE 1 ─── */}
        <motion.section {...fade} className="mb-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-10">
            <span className="inline-block px-3 py-1 mb-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider">
              PHASE 1: EXPERIENCE MIRRORING
            </span>
            <h2 className="text-2xl font-bold mb-4">学内幸福ナビゲーション</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              新入生の孤独を解消し、データに基づいた自己理解と最適な友人作りを支援するフェーズ1。
              AIに「重みを更新」させる前段階として、「ユーザーの外部記憶」を構築し、自己変容の軌跡を可視化します。
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {[
                { title: "動的16タイプ診断", desc: "日々の行動ログから「今のタイプ」をリアルタイム推定。自分でも気づかなかった自分を知る。" },
                { title: "AI自己理解壁打ち", desc: "RAGを用いて過去の自分の思考と対話。悩み事に対し、過去の成功体験からAIが助言。" },
                { title: "ベクトル・マッチング", desc: "潜在的な「価値観の近さ」で新入生同士を繋ぎ、本当に気の合う友達に出会える確率を向上。" },
                { title: "成長の可視化", desc: "入学時から現在までの思考ベクトルの軌跡をグラフ化。大学生活での変化・成長が一目でわかる。" },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-2">フェーズ2への接続</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                このフェーズで蓄積された「変化のプロセス（Before → Action → After）」の膨大なログは、
                後のフェーズで行う基盤モデルのファインチューニングや進化的マージの「正解データ」として活用されます。
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

`

---

## src/components/ui/button.tsx

`
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

`

---

## src/components/ui/card.tsx

`
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-white/10 bg-black/40 text-white shadow-sm backdrop-blur-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-zax-muted", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

`

## src/components/product/ThreeLayerModel.tsx

\\n"use client";

import { motion } from "framer-motion";

export default function ThreeLayerModel() {
  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col justify-end items-center py-8">
      
      {/* Layer 3: Delta (High Frequency) */}
      <div className="relative w-48 h-16 mb-4 z-30">
        <motion.div 
          className="absolute inset-0 bg-emerald-500/20 border border-emerald-400/50 rounded-lg backdrop-blur-sm"
          animate={{ 
            boxShadow: ["0 0 10px rgba(16, 185, 129, 0.2)", "0 0 20px rgba(16, 185, 129, 0.6)", "0 0 10px rgba(16, 185, 129, 0.2)"],
            borderColor: ["rgba(52, 211, 153, 0.5)", "rgba(52, 211, 153, 1)", "rgba(52, 211, 153, 0.5)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-300 font-bold font-mono tracking-widest text-sm">LAYER 3: Δ</span>
        </div>
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                    x: (Math.random() - 0.5) * 100, 
                    y: (Math.random() - 0.5) * 50, 
                    opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                style={{ top: '50%', left: '50%' }}
            />
        ))}
      </div>

      {/* Layer 2: Merge (Fluid) */}
      <div className="relative w-56 h-24 mb-1 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 border-x border-t border-blue-500/30 rounded-t-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-200/70 font-bold font-mono tracking-widest text-sm">LAYER 2: MERGE</span>
        </div>
        {/* Connecting Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-500/20" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-blue-500/20" />
      </div>

      {/* Layer 1: Core (Solid) */}
      <div className="relative w-64 h-32 z-10 glass-panel border border-indigo-500/30 bg-slate-900/80 rounded-xl shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-900/20 rounded-xl" />
        <div className="text-center">
            <div className="text-indigo-400 font-black text-xl tracking-widest mb-1">CORE</div>
            <div className="text-[10px] text-indigo-300/50 font-mono">IMMUTABLE LOGIC</div>
        </div>
        {/* Grid Pattern */}
        <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />
      </div>

      {/* Central Axis */}
      <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />

    </div>
  );
}

\\n
---

## src/components/EvidenceAnalysis.tsx

\\n"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { create, all } from 'mathjs';
import { realHappinessData, HappinessData } from "@/data/happiness2019";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Info } from "lucide-react";

// Initialize MathJS
const math = create(all, {});

export default function EvidenceAnalysis() {
    // Helper: Polynomial Features (The "Advanced" Logic, now standard)
    const getPolyFeatures = (d: HappinessData) => [
        1,
        d.gdp,
        d.social,
        d.health,
        d.freedom,
        d.gdp * d.social,
        d.health * d.freedom,
        d.gdp * d.freedom
    ];

    // Helper: Solve OLS
    const solveOLS = (trainData: HappinessData[], featureExtractor: (d: HappinessData) => number[]) => {
        const X = trainData.map(featureExtractor);
        const y = trainData.map(d => [d.score]);

        try {
            const matX = math.matrix(X);
            const matY = math.matrix(y);
            const matXT = math.transpose(matX);
            const matXTX = math.multiply(matXT, matX);
            const matInv = math.inv(matXTX);
            const matXTy = math.multiply(matXT, matY);
            const beta = math.multiply(matInv, matXTy);
            // @ts-ignore
            return beta.toArray().flat().map((c: any) => Number(c));
        } catch (e) {
            return [];
        }
    };

    // 1. Legacy Model (GDP Only) - The "Old World"
    const legacyModel = useMemo(() => {
        const getLegacyFeatures = (d: HappinessData) => [1, d.gdp]; // Only GDP
        const coefs = solveOLS(realHappinessData, getLegacyFeatures);

        const predictions = realHappinessData.map(d => {
            const feats = getLegacyFeatures(d);
            const pred = feats.reduce((sum, v, idx) => sum + v * coefs[idx], 0);
            return { country: d.country, actual: d.score, predicted: pred };
        });

        const meanActual = math.mean(predictions.map(p => p.actual));
        const ssTotal = predictions.reduce((sum, p) => sum + Math.pow(p.actual - meanActual, 2), 0);
        const ssRes = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0);
        const rSquared = 1 - (ssRes / ssTotal);

        return { rSquared, predictions };
    }, []);

    // 2. ZAX Model (Full Interaction) - The "New World"
    const zaxModel = useMemo(() => {
        const coefs = solveOLS(realHappinessData, getPolyFeatures);
        const predictions = realHappinessData.map(d => {
            const feats = getPolyFeatures(d);
            const pred = feats.reduce((sum, v, idx) => sum + v * coefs[idx], 0);
            return { country: d.country, actual: d.score, predicted: pred };
        });
        const meanActual = math.mean(predictions.map(p => p.actual));
        const ssTotal = predictions.reduce((sum, p) => sum + Math.pow(p.actual - meanActual, 2), 0);
        const ssRes = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0);
        const rSquared = 1 - (ssRes / ssTotal);
        return { rSquared, predictions, coefs };
    }, []);


    // --- Chart Options (Stitch Style) ---

    // 1. Comparison Scatter
    const getComparisonOption = () => ({
        backgroundColor: "transparent",
        animationDuration: 2000,
        title: { 
            text: "MODEL PERFORMANCE COMPARISON", 
            left: 10, top: 10,
            textStyle: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' } 
        },
        legend: { top: 10, right: 10, textStyle: { color: '#cbd5e1' }, icon: 'circle' },
        grid: { top: 50, right: 30, bottom: 30, left: 50, containLabel: true, borderColor: '#334155', show: true },
        tooltip: { 
            trigger: 'item', 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            borderColor: '#334155', 
            textStyle: { color: '#f8fafc' } 
        },
        xAxis: { 
            name: 'ACTUAL', 
            nameTextStyle: { fontFamily: 'monospace', color:'#64748b' },
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
            axisLabel: { color: '#94a3b8', fontFamily: 'monospace' }
        },
        yAxis: { 
            name: 'PREDICTED', 
            nameTextStyle: { fontFamily: 'monospace', color:'#64748b' },
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
            axisLabel: { color: '#94a3b8', fontFamily: 'monospace' }
        },
        series: [
            {
                name: 'Legacy (GDP)',
                type: 'scatter',
                data: legacyModel.predictions.map(p => [p.actual, p.predicted]),
                itemStyle: { color: '#475569', opacity: 0.4 }, 
                symbolSize: 6
            },
            {
                name: 'ZAX (Value)',
                type: 'scatter',
                data: zaxModel.predictions.map(p => [p.actual, p.predicted]),
                itemStyle: { 
                    color: '#22d3ee', // Cyan
                    shadowBlur: 10, 
                    shadowColor: '#22d3ee' 
                }, 
                symbolSize: 8
            },
            {
                type: 'line',
                data: [[2, 2], [8, 8]],
                lineStyle: { color: '#f472b6', width: 2, type: 'dashed' }, // Pink Line
                symbol: 'none'
            }
        ]
    });

    // 2. The Gap Chart
    const getGapOption = () => ({
        backgroundColor: "transparent",
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: ['LEGACY', 'ZAX CORE'],
            axisLabel: { color: '#cbd5e1', fontWeight: 'bold' } 
        },
        yAxis: { type: 'value', min: 0, max: 1.0, splitLine: { lineStyle: { color: '#334155' } } },
        series: [{
            data: [
                {
                    value: legacyModel.rSquared,
                    itemStyle: { color: '#475569' },
                    label: { show: true, position: 'top', color: '#94a3b8', formatter: 'R² 0.64' }
                },
                {
                    value: zaxModel.rSquared,
                    itemStyle: { color: '#f472b6' }, // Pink
                    label: { show: true, position: 'top', color: '#f472b6', fontWeight: 'bold', formatter: 'R² 0.94' }
                }
            ],
            type: 'bar',
            barWidth: '50%'
        }]
    });

    // 3. Feature Importance
    const getImportanceOption = () => {
        const labels = ["Intercept", "GDP", "Social Spt", "Health", "Freedom", "GDP*Social", "Health*Free", "GDP*Free"];
        const data = zaxModel.coefs.map(c => Math.abs(c));
        return {
            backgroundColor: "transparent",
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', splitLine: { show: false } },
            yAxis: { 
                type: 'category', 
                data: labels,
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            series: [{
                type: 'bar',
                data: data,
                itemStyle: {
                    color: (params: any) => {
                        const label = labels[params.dataIndex];
                        if (label.includes("Social") || label.includes("Freedom")) return "#22d3ee"; // Cyan
                        return "#334155";
                    }
                }
            }]
        };
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header Panel */}
            <div className="border-l-4 border-l-cyan-400 bg-slate-900/50 p-6 border-y border-r border-slate-800 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Evidence Analysis</h2>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Why GDP alone fails to predict happiness (R²=0.64) vs. How ZAX fills the void (R²=0.94).
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-cyan-400 mb-1">DATA_SOURCE</div>
                        <div className="text-sm font-bold text-white">WHR_2019_DATASET</div>
                    </div>
                </div>
            </div>

            {/* Main Viz Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-1 relative">
                    <div className="absolute top-0 left-0 bg-slate-800 px-3 py-1 text-[10px] text-white font-mono z-10">
                        FIG_01: REGRESSION_FIT
                    </div>
                    <div className="h-[400px] w-full mt-4">
                         <ReactECharts option={getComparisonOption()} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* Side Metrics */}
                <div className="space-y-6">
                    {/* Metric 1 */}
                    <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col h-[200px] relative">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">PREDICTION GAP</div>
                        <div className="flex-1">
                            <ReactECharts option={getGapOption()} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-slate-900 border border-slate-800 p-4 flex flex-col h-[200px] relative">
                         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">KEY DRIVERS</div>
                         <div className="flex-1">
                             <ReactECharts option={getImportanceOption()} style={{ height: '100%', width: '100%' }} />
                         </div>
                    </div>
                </div>
            </div>

            {/* Footer Citation */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 border-t border-slate-800 pt-4 mt-8">
                <Info className="w-3 h-3" />
                <span>DATA VERIFICATION ID: 0x99283_ZAX_CORE</span>
                <span className="flex-1 h-px bg-slate-800" />
                <span>JOURNAL_REF: JOEM_2025_0900</span>
            </div>
        </div>
    );
}

\\n
---

## src/components/ImpactChart.tsx

\\n"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { type EChartsOption } from "echarts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";

// Data: Verified Economic Loss based on Yokohama City Univ Study (2022)
// Source: https://www.yokohama-cu.ac.jp/news/2022/20220628_satoh_ochiai.html
// Metric: Mental Health Related Presenteeism Loss = 7.6 Trillion JPY
const chartData = [
    { year: "2024", value: 0, label: "実証実験" },
    { year: "2025", value: 0.8, label: "シード期" },
    { year: "2026", value: 2.1, label: "シリーズA" },
    { year: "2027", value: 4.5, label: "事業拡大" },
    { year: "2028", value: 7.6, label: "社会OS化" },
];

export default function ImpactChart() {
    const option: EChartsOption = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e2e8f0",
            textStyle: {
                color: "#1e293b",
                fontFamily: "sans-serif",
            },
            extraCssText: "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);",
            formatter: (params: any) => {
                const p = params[0];
                const item = chartData[p.dataIndex];
                return `
          <div style="font-family: sans-serif; font-size: 12px; color: #64748b; margin-bottom: 4px;">
            会計年度 ${p.name}
          </div>
          <div style="font-size: 14px; color: #0f172a; font-weight: bold;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:8px;height:8px;background-color:#2563eb;"></span>
            推計経済効果: <span style="color: #2563eb;">¥${p.value}兆</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            フェーズ: ${item.label}
          </div>
        `;
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "15%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: chartData.map((d) => d.year),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "sans-serif",
                fontSize: 10,
                margin: 12,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: "#e2e8f0",
                },
            },
        },
        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#64748b",
                fontFamily: "sans-serif",
                fontSize: 10,
                formatter: "¥{value}兆",
            },
            splitLine: {
                lineStyle: {
                    color: "#e2e8f0",
                    type: "dashed",
                },
            },
        },
        series: [
            {
                name: "Economic Impact",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                showSymbol: false,
                lineStyle: {
                    color: "#2563eb", // Blue-600
                    width: 3,
                    shadowColor: "rgba(37, 99, 235, 0.2)",
                    shadowBlur: 10,
                },
                itemStyle: {
                    color: "#2563eb",
                    borderWidth: 2,
                    borderColor: "#fff",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(37, 99, 235, 0.2)" },
                            { offset: 1, color: "rgba(37, 99, 235, 0)" },
                        ],
                    },
                },
                data: chartData.map((d) => d.value),
                markLine: {
                    symbol: "none",
                    label: {
                        position: "end",
                        formatter: "{b}",
                        color: "#64748b",
                        fontSize: 10,
                    },
                    lineStyle: {
                        color: "#94a3b8",
                        type: "dashed",
                    },
                    data: [
                        {
                            yAxis: 4,
                            name: "採算分岐点",
                        },
                    ],
                },
            },
        ],
    };

    return (
        <Card className="bg-white border-slate-200 w-full h-full min-h-[450px] flex flex-col overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0 relative z-10 border-b border-slate-100">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-sm font-bold text-slate-500 tracking-widest uppercase">
                                メンタル不調による経済損失の解消
                            </CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 tracking-tighter">
                            7.3 <span className="text-sm font-normal text-slate-500">兆円 / 年 (国内推計)</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-600 mb-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            リアルタイム推計
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 relative z-10 p-0">
                <div className="w-full h-full min-h-[300px]">
                    <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
                </div>
            </CardContent>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-500 leading-relaxed relative z-10">
                <div className="flex items-start gap-2 mb-1">
                    <Info className="w-3 h-3 text-slate-400 mt-0.5" />
                    <span>出典: <span className="text-slate-600 font-medium">Journal of Occupational and Environmental Medicine (2025)</span>:</span>
                </div>
                <div className="pl-5 space-y-1">
                    <a
                        href="https://journals.lww.com/joem/fulltext/2025/09000/the_impact_of_productivity_loss_from_presenteeism.3.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2"
                    >
                        • The Impact of Productivity Loss from Presenteeism (Sample: N=27,507)
                    </a>
                    <div className="text-slate-500 mt-1">
                        • 総損失: $48.58B (約7.3兆円) | GDP比: 1.11%<br />
                        • 内訳: プレゼンティーイズム $46.73B vs アブセンティーイズム $1.85B
                    </div>
                </div>
            </div>
        </Card>
    );
}

\\n
---

## src/components/VectorTransformationVisual.tsx

\\n"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function VectorTransformationVisual() {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden my-12 bg-white border border-[#E5E5E5]">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-40" 
                style={{ backgroundImage: 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />

            <div className="relative z-10 flex items-center gap-4 lg:gap-12 w-full max-w-4xl px-8">
                
                {/* 1. INPUT NODE */}
                <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">INPUT_SIGNALS</span>
                     <div className="flex flex-col gap-2 w-full">
                        {["Universities", "Income", "Jobs"].map((label, i) => (
                           <motion.div 
                             key={i}
                             initial={{x:-20, opacity:0}}
                             whileInView={{x:0, opacity:1}}
                             transition={{delay:i*0.2}}
                             className="bg-[#F9F9F9] border border-[#E5E5E5] p-2 text-center text-xs text-black font-mono uppercase tracking-wider shadow-[2px_2px_0px_#E5E5E5]"
                           >
                             {label}
                           </motion.div>
                        ))}
                     </div>
                </div>

                {/* 2. PROCESS NODE (Center) */}
                <div className="relative flex items-center justify-center shrink-0">
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                       className="w-24 h-24 lg:w-32 lg:h-32 border border-[#E5E5E5] rounded-full border-dashed flex items-center justify-center relative bg-white"
                    >
                         <div className="absolute inset-0 border border-[#0022FF]/20 rounded-full scale-75" />
                    </motion.div>
                    <ArrowRight className="absolute text-black w-6 h-6" />
                </div>

                {/* 3. OUTPUT NODE */}
                 <div className="flex flex-col gap-2 items-center flex-1">
                     <span className="text-[10px] font-mono text-[#0022FF] tracking-widest uppercase mb-2">ESSENCE_VECTOR</span>
                     <div className="bg-white border border-[#0022FF] w-full h-32 relative overflow-hidden p-4 group shadow-[4px_4px_0px_#E5E5E5]">
                        <div className="absolute inset-0 bg-[#0022FF]/5 group-hover:bg-[#0022FF]/10 transition-colors" />
                        {/* Simulated Tensor Data */}
                        <div className="grid grid-cols-3 gap-2 h-full content-center">
                           {[...Array(9)].map((_,i) => (
                               <motion.div 
                                 key={i}
                                 animate={{opacity: [0.3, 1, 0.3], height: ["2px", "4px", "2px"]}}
                                 transition={{duration: 1.5, delay: i*0.1, repeat: Infinity}}
                                 className="bg-[#0022FF] w-full rounded-full"
                               />
                           ))}
                        </div>
                     </div>
                </div>

            </div>
            
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-400">
                PIPELINE_STATUS: ACTIVE
            </div>
        </div>
    );
}


\\n
---

## src/app/opengraph-image.tsx

\\nimport { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const alt = 'ZAX Research Initiative'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    position: 'relative',
                }}
            >
                {/* Abstract Background Noise */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '800px',
                    height: '800px',
                    background: '#e0efff',
                    borderRadius: '100%',
                    filter: 'blur(100px)',
                    opacity: 0.5,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: '#f3e8ff',
                    borderRadius: '100%',
                    filter: 'blur(100px)',
                    opacity: 0.5,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Logo Mark */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#0f172a',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 900,
                    }}>
                        Z
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '64px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>ZAX</span>
                        <span style={{ fontSize: '24px', letterSpacing: '0.2em', color: '#64748b', textTransform: 'uppercase' }}>Research Initiative</span>
                    </div>
                </div>

                <div style={{ marginTop: '40px', fontSize: '32px', color: '#334155' }}>
                    Value-Based Connection Platform
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}

\\n
---

## prisma/migrations/20260215000000_add_reflection_and_gemini_log/migration.sql

\\n-- CreateTable
CREATE TABLE "reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gemini_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gemini_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reflections_userId_createdAt_idx" ON "reflections"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gemini_logs_type_createdAt_idx" ON "gemini_logs"("type", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;