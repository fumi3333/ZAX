export type Question = {
  id: number;
  text: string;
  category: 'Lifestyle' | 'Values' | 'Trust' | 'Conflict' | 'Ambition' | 'Tolerance';
  categoryJa: string;
  reverse?: boolean;
};

const _questions: Question[] = [
  // --- Lifestyle (ライフスタイル) --- 自律・情緒の安定・行動力・ユーモア・好奇心
  { id: 1,  text: "「面白そう」という感覚だけで、まだ何も知らない場所に飛び込んだことがある。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 2,  text: "気分が落ちているとき、自分で気持ちを切り替えられる方だ。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 3,  text: "予定が突然なくなっても、一人で楽しめる時間に変えられる。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 4,  text: "笑いのセンスが全く合わない人とは、長い付き合いは難しい。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 5,  text: "「なんとなくやってみた」が、人生の大事な転機になったことがある。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 6,  text: "誰かに頼まれなくても、自分で新しいことを始められる。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 7,  text: "調子が悪い日でも、それを周囲に過度にぶつけないよう意識できる。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 8,  text: "予想外のことが起きたとき、「どうしよう」より「どうする」が先に来る。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 9,  text: "好きなことを追いかけるために、周囲の目を気にしすぎたことはほとんどない。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },
  { id: 10, text: "知らない分野の話を聞くとき、退屈より「なるほど」が先に来る。", category: 'Lifestyle', categoryJa: 'ライフスタイル' },

  // --- Values (価値観・社会) --- 度胸・誠実さ・寛容さ・対等な視線・多様性への受容
  { id: 11, text: "自分の意見が少数派だとわかっていても、言うべき場面では言える。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 12, text: "相手の学歴・職業・収入ではなく、その人の中身で人を見ようとしている。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 13, text: "自分が信じていないことを「そうですね」と言わずに済む環境を選んできた。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 14, text: "政治的・宗教的に全く異なる考えの人でも、対話する価値があると思える。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 15, text: "「みんなそう言っている」は、自分の意見を変える理由にならない。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 16, text: "人が自分とは違う生き方をしていても、口を出したい衝動はほとんど感じない。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 17, text: "社会的に「正しい答え」を言うより、自分が本当に思っていることを言いたい。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 18, text: "年上・権威がある人の言葉でも、内容がおかしければおかしいと思える。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 19, text: "全く違うバックグラウンドを持つ人と話すのは、面倒より楽しいが先に来る。", category: 'Values', categoryJa: '価値観・社会' },
  { id: 20, text: "誰かの「普通じゃない選択」を聞いたとき、批判より「そういう道もあるか」と思える。", category: 'Values', categoryJa: '価値観・社会' },

  // --- Trust (信頼・協働) --- 誠実さ・本音の勇気・対等な視線
  { id: 21, text: "嫌われるかもしれないとわかっていても、本当のことを伝えられる。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 22, text: "誰かを好きになるとき、その人の「弱いところ」を見てからの方が信頼が深まる。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 23, text: "自分がミスしたとき、言い訳より「自分のせいです」と言える方だ。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 24, text: "一緒にいる相手が「有名」かどうかは、接し方にほとんど影響しない。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 25, text: "親しくなると、「引かれるかも」という不安より正直でいたい気持ちが勝る。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 26, text: "誰かを助けるとき、見返りや評価を計算してから行動することはほぼない。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 27, text: "「空気を読む」ことと「本音を殺す」ことは別物だと思っている。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 28, text: "親しい人が明らかに間違っていても、雰囲気を壊さないために黙ることが多い。", category: 'Trust', categoryJa: '信頼・協働', reverse: true },
  { id: 29, text: "信頼できる人と話しているとき、思ったことをそのまま出せる。", category: 'Trust', categoryJa: '信頼・協働' },
  { id: 30, text: "相手が「すごい人」だからといって、自分の意見を引っ込めることはほとんどない。", category: 'Trust', categoryJa: '信頼・協働' },

  // --- Conflict (コンフリクト解決) --- 情緒の安定・内省力・寛容さ・本音の勇気
  { id: 31, text: "言い合いになっても、感情より「何が問題か」を考える余裕がある方だ。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 32, text: "誰かに怒りを感じたとき、まず「なぜ怒っているか」を自分に問う癖がある。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 33, text: "相手に非があっても、「自分にも原因があったか」と考えることができる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 34, text: "自分が間違っていたとはっきりわかったとき、素直に認める言葉が出てくる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 35, text: "喧嘩した後、「あの時自分はどうだったか」と振り返る方だ。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 36, text: "怒っている人を前にして、怒りで返すより落ち着いて聞こうとする方だ。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 37, text: "「負けたくない」より「解決したい」が先に来る。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 38, text: "感情が激しくなったと感じたら、一度立ち止まれる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 39, text: "自分が傷ついたとき、相手を責めるより「なぜそうなったか」を考えられる。", category: 'Conflict', categoryJa: 'コンフリクト解決' },
  { id: 40, text: "不満を溜め込まず、適切なタイミングで伝えられる方だ。", category: 'Conflict', categoryJa: 'コンフリクト解決' },

  // --- Ambition (野心・キャリア) --- 行動力・好奇心・知性・自律
  { id: 41, text: "「まず動いてみてから考える」が自分のスタイルに近い。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 42, text: "知らないことに出会ったとき、不安より「調べてみたい」が先に来る。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 43, text: "自分のやりたいことのためなら、周囲に「なんで?」と言われても続けられる。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 44, text: "誰かに言われたからではなく、「これは面白い」と感じた方向に動いてきた。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 45, text: "複雑な問題を前にしたとき、構造を整理してから考えようとする癖がある。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 46, text: "完成度より、まずやってみることの方が大事だと思っている。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 47, text: "失敗した経験から、次にどう活かすかを考えることに時間を使う方だ。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 48, text: "「安定」より「挑戦」を選んできたことの方が多い。", category: 'Ambition', categoryJa: '野心・キャリア' },
  { id: 49, text: "誰かの成功を見て、「自分もやってみよう」より「すごいな」で終わることが多い。", category: 'Ambition', categoryJa: '野心・キャリア', reverse: true },
  { id: 50, text: "自分の考えを、論理的に組み立てて人に伝えることが得意な方だ。", category: 'Ambition', categoryJa: '野心・キャリア' },

  // --- Tolerance (寛容性・多様性) --- 寛容さ・多様性への受容・テキストの温度・内省力
  { id: 51, text: "全く違う価値観の人と話した後、「変わった人」より「面白かった」と思うことが多い。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 52, text: "SNSやメッセージで、相手の「文章の温度」を感じ取ることができる。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 53, text: "絵文字や改行の使い方から、その人の気遣いや性格を読む方だ。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 54, text: "誰かの考えが自分と違うとき、「間違っている」より「そういう見方もあるか」と思える。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 55, text: "「普通はこうだよね」という言葉に、違和感を覚える方だ。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 56, text: "異なる文化を持つ人の話を聞いて、自分の常識が揺らぐことが面白い。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 57, text: "誰かの「変わった趣味」を聞いたとき、引くより「どんな感じ?」と聞きたくなる。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 58, text: "テキストのやり取りで「この人、文章に気持ちが乗ってるな」と感じる人に惹かれる。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 59, text: "自分の「当たり前」が、誰かにとっては全く当たり前でないことを日常的に意識している。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
  { id: 60, text: "自分のことを「まだよくわかっていない」と感じながら生きている。", category: 'Tolerance', categoryJa: '寛容性・多様性' },
];

// ========================================
// 🔧 テスト中: 1問のみ表示
// 本番に戻すとき → この行を下の行に置き換える:
//   export const questions: Question[] = _questions;
// ========================================
// テストモード: export const questions: Question[] = _questions.slice(0, 1);
export const questions: Question[] = _questions;

export function effectiveScore(question: Question, rawScore: number): number {
  if (question.reverse) return 8 - rawScore;
  return rawScore;
}
