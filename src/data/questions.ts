export type Question = {
  id: number;
  text: string;
  category: 'Social' | 'Empathy' | 'Discipline' | 'Openness' | 'Emotional';
  categoryJa: string;
  reverse?: boolean;
};

export const questions: Question[] = [
  // Social Interaction (外向性・コミュニケーション)
  { id: 1, text: "初対面の人と会話を始めるのは得意な方だ。", category: 'Social', categoryJa: '外向性' },
  { id: 2, text: "週末は家で一人で過ごすよりも、友人と出かけたりイベントに参加したい。", category: 'Social', categoryJa: '外向性' },
  { id: 3, text: "グループの中では、聞き役よりも話し役になることが多い。", category: 'Social', categoryJa: '外向性' }
];

/** 1-7スケールで逆転項目の場合は 8 - score を返す */
export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}
