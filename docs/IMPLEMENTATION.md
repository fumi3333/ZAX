# ZAX 実装ガイド

このドキュメントは、ZAX の各機能の実装詳細と、コードの構造を説明します。

---

## 📁 ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # トップページ（LandingPage呼び出し）
│   ├── layout.tsx                # 共通レイアウト（CorporateHeader）
│   ├── globals.css               # Tailwind CSS + カスタムスタイル
│   │
│   ├── diagnostic/               # 診断フロー
│   │   ├── page.tsx              # 診断開始ページ
│   │   └── result/[id]/
│   │       └── page.tsx          # 診断結果 + マッチング表示
│   │
│   └── api/                      # API Routes
│       ├── diagnostic/submit/
│       │   └── route.ts          # 診断送信 → AI分析
│       ├── match/
│       │   └── route.ts          # マッチング検索
│       ├── analyze/
│       │   └── route.ts          # テキスト分析（汎用）
│       └── feedback/
│           └── route.ts          # フィードバック保存
│
├── components/                   # React コンポーネント
│   ├── CorporateHeader.tsx       # 固定ヘッダー（ハンバーガー）
│   ├── LandingPage.tsx           # ランディングページ
│   │
│   ├── diagnostic/               # 診断関連
│   │   ├── DiagnosticWizard.tsx  # 50問UI
│   │   ├── ResultRadarChart.tsx  # 単体レーダーチャート
│   │   ├── CompareRadarChart.tsx # 比較レーダーチャート
│   │   ├── MatchResults.tsx      # マッチング結果表示
│   │   └── FeedbackDialog.tsx    # フィードバックモーダル
│   │
│   └── ui/                       # shadcn/ui コンポーネント
│       ├── button.tsx
│       ├── card.tsx
│       └── table.tsx
│
├── lib/                          # ビジネスロジック
│   ├── gemini.ts                 # Gemini API ラッパー
│   ├── crypto.ts                 # AES-256 暗号化
│   │
│   ├── db/
│   │   └── client.ts             # Prisma + pgvector クライアント
│   │
│   └── rec/
│       └── engine.ts             # マッチングエンジン（50人アーキタイプ含む）
│
└── data/
    └── questions.ts              # 診断50問の定義
```

---

## 🔍 主要コンポーネント解説

### 1. 診断フロー (`DiagnosticWizard.tsx`)

**責務**: 50問の質問を1問ずつ表示し、回答を収集

**状態管理**:
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState<Record<number, number>>({});
```

**自動進行ロジック**:
```typescript
const handleAnswer = (value: number) => {
  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  
  // 300ms後に次の質問へ
  setTimeout(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
  }, 300);
};
```

**送信**:
```typescript
const handleSubmit = async () => {
  const response = await fetch('/api/diagnostic/submit', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  const data = await response.json();
  
  // 結果ページにリダイレクト
  window.location.href = `/diagnostic/result/${data.id}`;
};
```

---

### 2. AI分析API (`/api/diagnostic/submit/route.ts`)

**フロー**:

```typescript
export async function POST(req: Request) {
  const { answers } = await req.json();
  
  // 1. セッションからユーザーID取得
  const userId = await getUserIdFromSession();
  
  // 2. カテゴリ別スコア集計
  const categoryScores = calculateCategoryScores(answers);
  
  // 3. プロンプト構築
  const prompt = buildAnalysisPrompt(answers, categoryScores);
  
  // 4. Gemini Pro で分析
  const result = await model.generateContent(prompt);
  const synthesis = result.response.text();
  
  // 5. Embedding 生成
  const embeddingResult = await embeddingModel.embedContent(synthesis);
  const vector = embeddingResult.embedding.values; // 768次元
  
  // 6. DB保存
  const diagnosticResult = await prisma.diagnosticResult.create({
    data: {
      userId,
      answers: JSON.stringify(answers),
      synthesis,
      vector: JSON.stringify(vector),
    },
  });
  
  // 7. vectorStore にも保存（6次元に変換）
  await vectorStore.saveEmbedding(userId, vector6d, synthesis, 1.0);
  
  return NextResponse.json({ 
    success: true, 
    id: diagnosticResult.id 
  });
}
```

---

### 3. マッチングエンジン (`lib/rec/engine.ts`)

**50人のアーキタイプ**:

```typescript
export const ARCHETYPE_USERS = [
  { 
    id: "A-001", 
    name: "田中 健太", 
    vector: [92, 25, 35, 78, 40, 30],
    bio: "構造的な思考を得意とし...",
    tags: ["Logic", "Structure"]
  },
  // ... 全50人
];
```

**マッチング関数**:

```typescript
export async function findTopMatches(
  userVector: number[],
  topN: number = 5
): Promise<MatchResult[]> {
  
  // 1. DB検索を試みる
  try {
    const dbCandidates = await vectorStore.searchSimilar(userVector, 20);
    if (dbCandidates.length > 0) {
      // DB結果を使用
    }
  } catch (e) {
    // DB失敗時はアーキタイプ使用
  }
  
  // 2. アーキタイプ（50人）をフォールバック
  const results = ARCHETYPE_USERS.map((arch) => {
    const sim = cosineSimilarity(userVector, arch.vector);
    const score = calculateComplementarityScore(userVector, arch.vector);
    return {
      matchUser: arch,
      similarity: sim,
      growthScore: Math.round(score),
      reasoning: generateReasoning(userVector, arch.vector, sim),
    };
  });
  
  // 3. 補完性スコアでソート
  return results
    .sort((a, b) => b.growthScore - a.growthScore)
    .slice(0, topN);
}
```

---

### 4. マッチング結果UI (`MatchResults.tsx`)

**クライアントコンポーネント**: サーバーコンポーネントから`userVector`を受け取り、クライアント側でAPIコール

**useEffect でのフェッチ**:

```typescript
useEffect(() => {
  async function fetchMatches() {
    const res = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify({ vector: userVector, topN: 5 }),
    });
    const data = await res.json();
    setMatches(data.matches);
  }
  fetchMatches();
}, [userVector]);
```

**カード表示**:

```tsx
{top3.map((match, i) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    <MatchCard
      name={match.matchUser.name}
      bio={match.matchUser.bio}
      similarity={match.similarity}
      growthScore={match.growthScore}
      reasoning={match.reasoning}
      userVector={userVector}
      partnerVector={match.matchUser.vector}
    />
  </motion.div>
))}
```

---

### 5. 比較レーダーチャート (`CompareRadarChart.tsx`)

**recharts の2系列表示**:

```tsx
<RadarChart data={data}>
  <PolarGrid stroke="#e2e8f0" />
  <PolarAngleAxis dataKey="subject" />
  
  {/* 自分のベクトル（紫） */}
  <Radar
    name="あなた"
    dataKey="me"
    stroke="#6366f1"
    fill="#6366f1"
    fillOpacity={0.25}
  />
  
  {/* 相手のベクトル（ピンク） */}
  <Radar
    name="相手"
    dataKey="partner"
    stroke="#f43f5e"
    fill="#f43f5e"
    fillOpacity={0.2}
  />
  
  <Legend />
</RadarChart>
```

---

### 6. フィードバックモーダル (`FeedbackDialog.tsx`)

**状態**:
```typescript
const [enjoyment, setEnjoyment] = useState(5);
const [fulfillment, setFulfillment] = useState(5);
const [growthFeel, setGrowthFeel] = useState(5);
const [meetAgain, setMeetAgain] = useState(5);
const [text, setText] = useState("");
```

**送信**:
```typescript
const handleSubmit = async () => {
  const payload = {
    partnerId: match.matchUser.id,
    scores: { enjoyment, fulfillment, growthFeel, meetAgain },
    feedbackText: text,
  };
  
  console.log("📊 Feedback submitted:", payload);
  
  // 将来: await fetch("/api/feedback", { ... })
  
  setSubmitted(true);
};
```

---

## 🎨 デザインシステム

### カラーパレット

```css
/* Primary */
--slate-50: #f8fafc;
--slate-900: #0f172a;

/* Accent */
--indigo-600: #4f46e5;
--violet-600: #7c3aed;
--rose-500: #f43f5e;

/* Glass */
bg-white/70 + backdrop-blur-md
```

### コンポーネント設計原則

1. **グラスモルフィズム**: 半透明 + ぼかし
2. **大きな余白**: `py-28 lg:py-40`
3. **角丸**: `rounded-2xl` (16px)
4. **シャドウ**: `shadow-xl shadow-slate-200/30`
5. **ホバー**: `hover:shadow-2xl transition-shadow`

---

## 🧪 テストデータ

### 50人のアーキタイプユーザー

`lib/rec/engine.ts` に直接定義:

- **論理重視型** (10人): 田中健太、山本理沙...
- **直感・創造型** (10人): 佐藤愛、松本龍之介...
- **共感・調和型** (10人): 三浦優奈、前田隼人...
- **意志・推進型** (10人): 青木凌、藤井七海...
- **バランス・柔軟型** (10人): 竹内涼、金子ひなた...

**DB未接続でも動く設計** = Vercel上でデモ可能

---

## 🐛 デバッグ方法

### 1. ターミナルログ

```typescript
console.log("診断送信:", answers);
console.log("Gemini分析結果:", synthesis);
console.log("マッチング候補:", matches);
```

### 2. Prisma Studio

```bash
npx prisma studio
```

ブラウザでDB内容を確認・編集可能

### 3. ビルドエラー

```bash
npx next build
```

本番ビルドで検証（TypeScript型エラー等）

---

## 🔄 状態管理パターン

### クライアント状態（React hooks）

```typescript
// ローカル状態
const [isOpen, setIsOpen] = useState(false);

// フェッチ状態
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/...').then(res => setData(res));
}, []);
```

### サーバー状態（Prisma）

```typescript
// Server Component (async)
const result = await prisma.diagnosticResult.findUnique({
  where: { id },
});
```

---

## 📦 依存関係の役割

### 主要パッケージ

```json
{
  "@google/generative-ai": "Gemini API SDK",
  "@prisma/client": "型安全ORM",
  "framer-motion": "宣言的アニメーション",
  "recharts": "レーダーチャート描画",
  "lucide-react": "アイコンライブラリ",
  "bcryptjs": "パスワードハッシュ",
  "clsx": "条件付きクラス名",
  "tailwind-merge": "Tailwindクラスの競合解決"
}
```

---

## 🛠️ カスタマイズポイント

### 1. 質問の追加

`src/data/questions.ts`:

```typescript
export const questions = [
  {
    id: 51,
    text: "新しい質問",
    category: "openness",
    categoryJa: "論理性",
    reverse: false,
  },
  // ...
];
```

### 2. ベクトル次元の変更

`lib/rec/engine.ts` と `prisma/schema.prisma`:

```prisma
// 6次元 → 8次元に変更する場合
vector Unsupported("vector(8)")
```

```sql
-- マイグレーションSQL
ALTER TABLE essence_vectors
ALTER COLUMN vector TYPE vector(8);
```

### 3. 補完性スコアの調整

```typescript
// 最適類似度を0.5 → 0.4に変更
const optimalDistance = 0.4;
```

### 4. アーキタイプの追加

`lib/rec/engine.ts`:

```typescript
export const ARCHETYPE_USERS = [
  // ... 既存50人
  {
    id: "A-051",
    name: "新しいアーキタイプ",
    vector: [50, 50, 50, 50, 50, 50],
    bio: "...",
    tags: ["New"]
  },
];
```

---

## 🚨 よくあるエラーと対処

### エラー1: `Prisma Client NOT FOUND`

**原因**: `npx prisma generate` が実行されていない

**対処**:
```bash
npx prisma generate
```

### エラー2: `DB connection failed`

**原因**: PostgreSQL（Docker）が起動していない

**対処**:
```bash
docker-compose up -d
```

### エラー3: `GOOGLE_API_KEY not found`

**原因**: `.env.local` に API キーが未設定

**対処**:
```env
GOOGLE_API_KEY=your_actual_key_here
```

### エラー4: `Invalid vector format`

**原因**: `/api/match` に渡すベクトルが6次元でない

**対処**:
```typescript
// 必ず6次元の配列を送信
vector: [80, 60, 90, 45, 70, 85]  // ✅
vector: [80, 60, 90]              // ❌
```

---

## 🔧 開発Tips

### 1. ホットリロード

Next.js 16 は Turbopack を使用:
```bash
npm run dev --turbopack
```

ファイル保存で即座に反映

### 2. TypeScript型チェック

```bash
npx tsc --noEmit
```

型エラーを事前検出

### 3. Prisma Studio

```bash
npx prisma studio
```

DB内容をGUIで確認

### 4. コンソールデバッグ

```typescript
console.log("DEBUG:", JSON.stringify(data, null, 2));
```

構造化されたログ出力

---

## 📝 コーディング規約

### ファイル命名

- コンポーネント: `PascalCase.tsx`
- API: `route.ts`
- ユーティリティ: `camelCase.ts`

### 関数命名

```typescript
// 動詞始まり
function calculateScore() {}
async function fetchData() {}

// コンポーネントは名詞
export default function UserCard() {}
```

### CSS クラス

```tsx
// Tailwind: 機能順（レイアウト → 装飾 → 状態）
<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-slate-50">
```

---

次のドキュメント: [APIリファレンス](./API_REFERENCE.md)
