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

    profileText += "\n指示: この人物の強み、弱み、コミュニケーションスタイル、適した環境について、プロの心理分析官としてわかりやすい言葉でシンプルなレポートを作成してください（約800〜1000文字程度）。回答には自由記述の内容も深く反映させてください。出力に「AI」という語は含めず、マークダウン（*や#）も絶対に使用しないでください。";
    
    // 3. Call Gemini for Synthesis 
    let synthesis = "分析エラーが発生しました。時間を置いて再試行してください。";

    try {
        const result = await model.generateContent(profileText);
        let responseText = await result.response.text();
        responseText = responseText.replace(/[*#]/g, '').trim(); // Markdown除去
        synthesis = responseText || synthesis;
    } catch (e) {
        console.warn("Gemini API Error (Synthesis):", e);
    }

    // 4. 6次元ベクトル (レーダーチャート用)
    const categoryOrder = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const jaMap: Record<string, string> = { 'Social': '外向性', 'Empathy': '協調性', 'Discipline': '誠実性', 'Openness': '開放性', 'Emotional': '情緒安定性' };
    const rawByCat = categoryOrder.map(c => {
        const d = categoryScores[jaMap[c]];
        const avg = d && d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector6d = [discipline, openness, empathy, discipline, openness, Math.round((emotional + social) / 2)];

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
