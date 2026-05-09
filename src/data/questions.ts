export type Question = {
  id: number;
  text: string;
  category: 'Lifestyle' | 'Values' | 'Romance' | 'Conflict' | 'Ambition';
  categoryJa: string;
  reverse?: boolean;
};

export const questions: Question[] = [
  // --- Lifestyle (ライフスタイル) ---
  { id: 1, text: "休日は家でリラックスするより、外に出かけてアクティブに過ごしたい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 2, text: "金銭感覚は、節約よりも「今の経験」にお金を使いたい派だ。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 3, text: "将来、都会のど真ん中よりも、静かな郊外や自然の近くで暮らしたい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 4, text: "家事は分担するより、得意な方がまとめてやるべきだと思う。", category: 'Lifestyle', categoryJa: 'ライフスタイル', reverse: true },
  { id: 5, text: "定期的な運動や健康的な食生活を、何よりも優先して維持したい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 6, text: "自分の部屋や生活空間は、常にきれいに整頓されていないと落ち着かない。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 7, text: "夜型よりも朝型であり、午前中から活動を開始したい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 8, text: "旅行は無計画で行き当たりばったり楽しむのが好きだ。", category: 'Lifestyle', categoryJa: 'ライフスタイル', reverse: true },
  { id: 9, text: "パートナーとは、趣味や休日の過ごし方をなるべく共有したい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 10, text: "一人の時間を毎日確保できないと、かなりのストレスを感じる。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },

  // --- Values & Politics (価値観・政治) ---
  { id: 11, text: "伝統や社会的規範よりも、個人の自由な選択が何より尊重されるべきだ。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 12, text: "政治的な意見や価値観が大きく異なる人とは、深い関係を築くのは難しい。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 13, text: "社会の不平等に対して、自分自身が何らかのアクションを起こすべきだと思う。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 14, text: "宗教やスピリチュアルな信念は、自分の人生において重要な位置を占めている。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 15, text: "子供を持つことは、人生において必須、あるいは非常に重要だと考えている。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 16, text: "性別による役割分担（男は仕事、女は家庭など）には強く反対する。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 17, text: "社会の安定よりも、急進的な革新や変化を支持する。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 18, text: "地球環境保護のためなら、自分の生活水準を下げることも厭わない。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 19, text: "「努力すれば必ず報われる」という考え方は、現代でも正しいと思う。", category: 'Values', categoryJa: '価値観・社会', reverse: true },
  { id: 20, text: "資本主義の利益追求よりも、社会福祉や富の再分配を重視すべきだ。", category: 'Values', categoryJa: '価値観・社会' },

  // --- Romance & Intimacy (恋愛・親密さ) ---
  { id: 21, text: "愛情表現は、言葉よりもスキンシップなどの行動で示してほしい。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 22, text: "パートナーとは、すべてを共有するより、ある程度の秘密やプライバシーを持っていたい。", category: 'Romance', categoryJa: '恋愛・親密さ', reverse: true },
  { id: 23, text: "記念日やイベント（誕生日、クリスマスなど）は、特別に祝うことが大切だ。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 24, text: "体の相性（性的魅力や価値観）は、長期的な関係において非常に重要だ。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 25, text: "パートナーからの連絡には、できるだけ早く（数時間以内に）返信したいし、相手にもそうしてほしい。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 26, text: "関係が安定した後も、定期的にデートをしてロマンチックな雰囲気を楽しみたい。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 27, text: "過去の恋愛について、お互いに隠し事なくすべて話せる関係が理想だ。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 28, text: "パートナーの異性の友人と二人きりで遊ぶことには、抵抗を感じる。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 29, text: "愛情を感じる瞬間は、相手が自分のために何かしてくれた（尽くしてくれた）時だ。", category: 'Romance', categoryJa: '恋愛・親密さ' },
  { id: 30, text: "結婚の形式（事実婚や別姓など）にはこだわらず、二人の繋がりを重視したい。", category: 'Romance', categoryJa: '恋愛・親密さ' },

  // --- Conflict & Dealbreakers (コンフリクト・許容範囲) ---
  { id: 31, text: "喧嘩をしたときは、一旦距離を置くより、その場ですぐに話し合って解決したい。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 32, text: "パートナーの欠点を直そうとするより、そのまま受け入れる方が大切だ。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 33, text: "自分が間違っていたと感じたら、プライドを捨ててすぐに謝ることができる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 34, text: "感情的になっている相手に対しては、論理的な正論で返すことが多い。", category: 'Conflict', categoryJa: 'コンフリクト解決', reverse: true },
  { id: 35, text: "過去の過ちを許すことができるタイプであり、後から蒸し返すことはしない。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 36, text: "タバコを吸う人、またはギャンブルをする人とは、パートナーになれない。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 37, text: "自分の家族とパートナーの仲が悪くても、パートナーの意見を優先する。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 38, text: "ストレスが溜まると、人に当たるのではなく、一人で塞ぎ込んでしまう。", category: 'Conflict', categoryJa: 'コンフリクト解決', reverse: true },
  { id: 39, text: "話し合いで意見が対立した際、相手を論破することに快感を感じることがある。", category: 'Conflict', categoryJa: 'コンフリクト解決', reverse: true },
  { id: 40, text: "意見の相違があっても、「相手には相手の正義がある」と完全に割り切れる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },

  // --- Future & Ambition (将来・野心) ---
  { id: 41, text: "安定した職業に就くことより、リスクを取ってでも自分のやりたいことに挑戦したい。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 42, text: "仕事での成功や社会的地位の向上が、人生の幸福において最重要だ。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 43, text: "将来、海外に移住するか、複数の拠点を持って生活してみたい。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 44, text: "パートナーには、自分と同じくらい高い野心や目標を持っていてほしい。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 45, text: "人生のゴールは、財産を築くことよりも、人に影響を与えたり世界を良くすることだ。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 46, text: "もしパートナーの転勤や挑戦のために引っ越す必要があるなら、自分のキャリアを犠牲にできる。", category: 'Ambition', categoryJa: '野心・キャリア', reverse: true },
  { id: 47, text: "一生学び続ける姿勢を持ち、自己研鑽を怠らない人生でありたい。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 48, text: "ワークライフバランスよりも、今は仕事やプロジェクトに100%打ち込みたい時期がある。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 49, text: "人生の大きな決断をするときは、直感よりも緻密なデータや計画を信用する。", category: 'Ambition', categoryJa: '野心・キャリア', reverse: true },
  { id: 50, text: "「何者かになりたい」という強い欲望が、常に自分を突き動かしている。", category: 'Ambition', categoryJa: '野心・キャリア' },
];

export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}
