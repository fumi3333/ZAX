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
