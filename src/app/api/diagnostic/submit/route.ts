import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions, effectiveScore } from '@/data/questions';
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
