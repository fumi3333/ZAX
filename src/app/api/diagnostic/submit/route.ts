import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini'; // Import shared instances
import { cookies } from 'next/headers';

export const maxDuration = 60; // タイムアウトを60秒に延長

export async function POST(req: Request) {
  try {
    const { answers, freetext } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate User (or create guest session)
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        const email = `guest_${sessionId}@musashino-u.ac.jp`;
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
             try {
                user = await prisma.user.create({ data: { email, password: "guest-password" } });
             } catch (e) {
                 const firstUser = await prisma.user.findFirst();
                 if (firstUser) user = firstUser;
                 else throw new Error("Could not create or find user");
             }
        }
    }
    if (user) userId = user.id;

    // 2. Construct Analysis Prompt
    let profileText = "以下の性格診断（1-7尺度）の回答と自由記述に基づき、深い分析を行ってください。\n\n";
    
    if (freetext) {
        profileText += `## 本人の自由記述（悩み、理想、価値観）\n"${freetext}"\n\n`;
    }

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

    profileText += "## 診断スコア傾向\n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        profileText += `- ${cat}: 平均 ${(data.sum / data.count).toFixed(1)}/7.0\n`;
    }

    profileText += "\n指示: この人物の強み、弱み、コミュニケーションスタイル、適した環境について、プロの心理分析官として詳細なレポートを作成してください。回答には自由記述の内容も深く反映させてください。出力に「AI」という語は含めないでください。";
    
    // 3. Call Gemini for Synthesis (Skip for guest to encourage registration)
    let synthesis = "登録後にAI詳細分析レポートが生成されます。";
    const isGuest = user?.email.startsWith("guest_");

    if (!isGuest) {
        try {
            const result = await model.generateContent(profileText);
            const response = await result.response;
            synthesis = response.text() || synthesis;
        } catch (e) {
            console.warn("Gemini API Error (Synthesis):", e);
            synthesis = "分析エラーが発生しました。時間を置いて再試行してください。";
        }
    }

    // 4. 6次元ベクトル (レーダーチャート用)
    // 診断カテゴリ: Social(外向性), Empathy(協調性), Discipline(誠実性), Openness(開放性), Emotional(情緒安定性)
    const categoryOrder = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const jaMap: Record<string, string> = { 'Social': '外向性', 'Empathy': '協調性', 'Discipline': '誠実性', 'Openness': '開放性', 'Emotional': '情緒安定性' };
    const rawByCat = categoryOrder.map(c => {
        const d = categoryScores[jaMap[c]];
        const avg = d && d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;

    // 6次元それぞれを独立した意味で計算（バグ修正: discipline/opennessの重複を解消）
    // 論理性 = 誠実性（構造的・計画的思考）
    // 直感力 = 開放性（新しいアイデアへの感度）
    // 共感性 = 協調性（他者への感情的理解）
    // 意志力 = 誠実性×情緒安定性の組み合わせ（粘り強さ・継続力）
    // 創造性 = 開放性×外向性の組み合わせ（発散思考・表現力）
    // 柔軟性 = 情緒安定性×開放性の組み合わせ（変化への適応力）
    const vector6d = [
        discipline,                                    // 論理性
        openness,                                      // 直感力
        empathy,                                       // 共感性
        Math.round((discipline + emotional) / 2),      // 意志力
        Math.round((openness + social) / 2),           // 創造性
        Math.round((emotional + openness) / 2),        // 柔軟性
    ];

    // 4.5. 768次元ベクトル (セマンティック検索用)
    let embedding768: number[] | undefined = undefined;
    try {
        const embedText = `Synthesis: ${synthesis}\nFreetext: ${freetext || "N/A"}`;
        const embeddingResult = await embeddingModel.embedContent(embedText);
        embedding768 = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.warn("Gemini API Error (Embedding):", e);
    }

    // 5. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(vector6d),
      },
    });

    await vectorStore.saveEmbedding(
        userId,
        vector6d,
        "性格診断結果と自由記述に基づく分析",
        1.0,
        embedding768 // 768次元を追加
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: answers,
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
