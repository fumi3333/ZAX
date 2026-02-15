# ZAX 全ソースコード一覧

> **用途**: Gemini 等でコードレビューする際にこのファイルを参照してください。  
> **場所**: プロジェクトルート `c:\ZAX\ZAX_FULL_CODE.md`


---
## prisma\schema.prisma

```schema.prisma
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

  @@map("users")
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

```

---
## src\lib\rec\engine.ts

```engine.ts
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

// 補完性スコア: 類似度0.5をピークとするベルカーブ
export function calculateComplementarityScore(userVec: number[], targetVec: number[]): number {
  const sim = cosineSimilarity(userVec, targetVec);
  const optimalDistance = 0.5;
  const growthPotential = Math.exp(-Math.pow(sim - optimalDistance, 2) / 0.1);
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
  userSynthesis?: string
): Promise<MatchResult[]> {

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
        const score = calculateComplementarityScore(userVector, candidateVector);

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
    const score = calculateComplementarityScore(userVector, arch.vector);
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

```

---
## src\app\api\diagnostic\submit\route.ts

```route.ts
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions } from '@/data/questions';
import { model } from '@/lib/gemini';
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
    }

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断（1-7尺度、1:同意しない - 4:中立 - 7:同意する）の回答に基づき、この人物の性格、価値観、行動特性を詳細に分析し、日本語で記述してください。\n\n";
    
    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      const score = answers[id];
      if (q) {
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += score;
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

```

---
## src\components\diagnostic\DiagnosticResultClient.tsx

```DiagnosticResultClient.tsx
"use client";

import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
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
    if (q && categoryScores[q.category]) {
      categoryScores[q.category].sum += score;
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

```

---
## src\data\questions.ts

```questions.ts
export type Question = {
  id: number;
  text: string;
  category: 'Social' | 'Empathy' | 'Discipline' | 'Openness' | 'Emotional';
  categoryJa: string;
};

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  { id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' },
  { id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' },
  { id: 4, text: "注目を浴びることに抵抗がない、むしろ好きだ。", category: 'Social', categoryJa: '外向性' },
  { id: 5, text: "自分の感情や考えを、すぐに言葉にして表現する方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 6, text: "パーティーや交流会など、人が多い場所に行くとエネルギーをもらえる。", category: 'Social', categoryJa: '外向性' },
  { id: 7, text: "電話よりもテキストメッセージでのやり取りを好む。", category: 'Social', categoryJa: '外向性' }, // Note: Reverse score logic will be handled in analysis if needed, but for vectorization raw score + text is fine.
  { id: 8, text: "誰かと一緒にいるとき、沈黙が続くと気まずいと感じる。", category: 'Social', categoryJa: '外向性' },
  { id: 9, text: "浅く広い付き合いよりも、狭く深い付き合いを好む。", category: 'Social', categoryJa: '外向性' },
  { id: 10, text: "他人の意見に流されず、自分の主張をはっきりと伝えることができる。", category: 'Social', categoryJa: '外向性' },

  // Empathy & Harmony (協調性・共感性)
  { id: 11, text: "他人の感情の変化に敏感で、すぐ気がつく方だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 12, text: "困っている人がいると、自分のことを後回しにしてでも助けたくなる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 13, text: "議論で勝つことよりも、相手との調和を保つことの方が重要だと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 14, text: "人を批判するよりも、良いところを見つけて褒めるようにしている。", category: 'Empathy', categoryJa: '協調性' },
  { id: 15, text: "自分の利益よりも、チームやコミュニティ全体の利益を優先する。", category: 'Empathy', categoryJa: '協調性' },
  { id: 16, text: "映画や小説の登場人物に感情移入して泣いてしまうことがある。", category: 'Empathy', categoryJa: '協調性' },
  { id: 17, text: "他人の失敗に対して寛容であり、すぐに許すことができる。", category: 'Empathy', categoryJa: '協調性' },
  { id: 18, text: "嘘をつくことは、どんな理由があっても良くないと思う。", category: 'Empathy', categoryJa: '協調性' },
  { id: 19, text: "人からの頼み事を断るのが苦手だ。", category: 'Empathy', categoryJa: '協調性' },
  { id: 20, text: "競争する環境よりも、協力し合う環境の方が能力を発揮できる。", category: 'Empathy', categoryJa: '協調性' },

  // Discipline & Order (誠実性・規律)
  { id: 21, text: "部屋や机の上は常に整理整頓されている。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 22, text: "計画を立ててから行動する方で、行き当たりばったりの行動は避ける。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 23, text: "期限や約束の時間は必ず守る。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 24, text: "一度始めたことは、どんなに困難でも最後までやり遂げる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 25, text: "細かい部分まで注意を払い、ミスがないよう徹底するタイプだ。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 26, text: "ルールや規則は、社会秩序のために厳格に守るべきだと思う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 27, text: "衝動買いをすることはほとんどなく、慎重にお金を使う。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 28, text: "目標達成のためなら、目先の快楽を我慢できる。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 29, text: "効率性を重視し、無駄な作業は極力省きたい。", category: 'Discipline', categoryJa: '誠実性' },
  { id: 30, text: "何事も準備不足だと不安を感じる。", category: 'Discipline', categoryJa: '誠実性' },

  // Openness & Curiosity (開放性・知的好奇心)
  { id: 31, text: "抽象的な概念や哲学的な議論をするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 32, text: "伝統や慣習よりも、新しい方法や革新的なアイデアに惹かれる。", category: 'Openness', categoryJa: '開放性' },
  { id: 33, text: "美術館に行ったり、芸術作品に触れたりするのが好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 34, text: "予測可能な日常よりも、変化に富んだ刺激的な毎日を求めている。", category: 'Openness', categoryJa: '開放性' },
  { id: 35, text: "未知の分野や新しい趣味に挑戦することにワクワクする。", category: 'Openness', categoryJa: '開放性' },
  { id: 36, text: "物事を多角的な視点から見るのが得意だ。", category: 'Openness', categoryJa: '開放性' },
  { id: 37, text: "「なぜ？」と根本的な理由を考えることがよくある。", category: 'Openness', categoryJa: '開放性' },
  { id: 38, text: "SF映画やファンタジー小説など、現実離れした世界観が好きだ。", category: 'Openness', categoryJa: '開放性' },
  { id: 39, text: "自分の価値観が絶対だとは思わず、多様な考え方を受け入れられる。", category: 'Openness', categoryJa: '開放性' },
  { id: 40, text: "クリエイティブな活動（執筆、描画、制作など）に時間を費やすのが好きだ。", category: 'Openness', categoryJa: '開放性' },

  // Emotional Logic / Stability (情緒安定性・メンタル)
  { id: 41, text: "プレッシャーのかかる状況でも、冷静に対処できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 42, text: "些細なことでイライラしたり、落ち込んだりすることは少ない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 43, text: "将来に対して不安を感じるより、楽観的に考えることが多い。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 44, text: "失敗しても、すぐに気持ちを切り替えて次の行動に移せる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 45, text: "他人からの批判を個人的な攻撃として受け取らず、冷静に分析できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 46, text: "感情の起伏が激しい方ではない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 47, text: "リラックスする時間を意識的に確保している。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 48, text: "自分の弱みを見せることに抵抗がない。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 49, text: "予期せぬトラブルが起きてもパニックにならずに対応できる。", category: 'Emotional', categoryJa: '情緒安定性' },
  { id: 50, text: "自分自身に対して自信を持っており、自己肯定感が高い。", category: 'Emotional', categoryJa: '情緒安定性' },
];

```

---
## src\lib\gemini.ts

```gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

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

        return {
            ...parsed,
            embedding: embeddingResult.embedding.values // Attach High-Dim Vector
        };
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
        return (await result.response).text().trim().slice(0, 120) || `${partnerName}さんとの相性が良いです。`;
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
        return (await result.response).text().trim().slice(0, 80) || "あなたの振り返りが記録されました。";
    } catch (e) {
        console.warn("Reflection summary error:", e);
        return "あなたの振り返りが記録されました。";
    }
}

```

---
## src\lib\db\client.ts

```client.ts
// ZAX Database Client — Prisma + pgvector
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック

let prisma: any;
let vectorStore: any;

// DATABASE_URL が無い場合はモックのみ使用（Vercel等で未設定時）
const useRealDb = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432/dummy")
);

if (!useRealDb) {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "postgresql://localhost:5432/dummy";
    }
}

try {
    if (!useRealDb) throw new Error("Using mock DB");
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number
        ) {
            const vectorString = `[${vector.join(",")}]`;
            await prisma.$executeRaw`
                INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
            `;
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            const vectorString = `[${targetVector.join(",")}]`;
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
    console.warn(
        "⚠️ Prisma Client が見つかりません。インメモリ・モックを使用します。",
        e.message
    );

    // In-Memory Mock Store (Prisma未生成時 or ビルド時のフォールバック)
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

```

---
## src\app\api\match\route.ts

```route.ts
import { NextResponse } from "next/server";
import { findTopMatches } from "@/lib/rec/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vector, topN = 5, synthesis } = body;

    if (!vector || !Array.isArray(vector) || vector.length !== 6) {
      return NextResponse.json(
        { error: "Invalid vector: must be a 6-dim array" },
        { status: 400 }
      );
    }

    const matches = await findTopMatches(vector, topN, synthesis);

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

```

---
## src\components\diagnostic\DiagnosticWizard.tsx

```DiagnosticWizard.tsx
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
  const allAnswered = answeredCount >= totalQuestions * 0.8 ||
                      (currentQuestionIndex === totalQuestions - 1 && answeredCount >= totalQuestions * 0.7);

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

```

---
## src\components\diagnostic\MatchResults.tsx

```MatchResults.tsx
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

interface MatchResultsProps {
  userVector: number[];
  synthesis?: string;
}

export default function MatchResults({ userVector, synthesis }: MatchResultsProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vector: userVector, topN: 5, synthesis }),
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
  }, [userVector, synthesis]);

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

```