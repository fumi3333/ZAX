import { vectorStore } from "../db/client";

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
export async function findTopMatches(userVector: number[], topN: number = 5): Promise<MatchResult[]> {

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

        results.push({
          matchUser: {
            id: candidate.userId,
            name: "Resonant Soul",
            vector: candidateVector,
            bio: candidate.reasoning || "ベクトル空間上で共鳴する存在。",
            tags: [],
          },
          similarity: sim,
          growthScore: Math.round(score),
          reasoning: generateReasoning(userVector, candidateVector, sim),
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
  const results: MatchResult[] = ARCHETYPE_USERS.map((arch) => {
    const sim = cosineSimilarity(userVector, arch.vector);
    const score = calculateComplementarityScore(userVector, arch.vector);
    return {
      matchUser: arch,
      similarity: sim,
      growthScore: Math.round(score),
      reasoning: generateReasoning(userVector, arch.vector, sim),
    };
  });

  return results
    .sort((a, b) => b.growthScore - a.growthScore)
    .slice(0, topN);
}

// 後方互換
export async function findBestMatch(userVector: number[]): Promise<MatchResult> {
  const matches = await findTopMatches(userVector, 1);
  return matches[0];
}
