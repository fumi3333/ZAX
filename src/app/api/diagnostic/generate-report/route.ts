import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { model } from '@/lib/gemini';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { resultId } = await req.json();
    if (!resultId) {
      return NextResponse.json({ success: false, error: 'Result ID is required' }, { status: 400 });
    }

    const diagnosticResult = await prisma.diagnosticResult.findUnique({
      where: { id: resultId },
      include: { user: true }
    });

    if (!diagnosticResult) {
      return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
    }

    // Parse the 6D vector
    let vector6d: number[] = [50, 50, 50, 50, 50, 50];
    try {
      const parsed = JSON.parse(diagnosticResult.vector);
      if (Array.isArray(parsed)) vector6d = parsed;
    } catch { /* use default */ }

    // Parse answers to include score tendencies in the prompt
    let answersText = '';
    try {
      const answers = JSON.parse(diagnosticResult.answers as string);
      const { questions } = await import('@/data/questions');
      const categoryScores: Record<string, { sum: number; count: number }> = {};
      for (const [idStr, score] of Object.entries(answers)) {
        const q = questions.find(q => q.id === Number(idStr));
        if (q) {
          if (!categoryScores[q.categoryJa]) categoryScores[q.categoryJa] = { sum: 0, count: 0 };
          categoryScores[q.categoryJa].sum += score as number;
          categoryScores[q.categoryJa].count += 1;
        }
      }
      for (const [cat, d] of Object.entries(categoryScores)) {
        answersText += `- ${cat}: 平均 ${(d.sum / d.count).toFixed(1)}/7.0\n`;
      }
    } catch { /* skip if unavailable */ }

    const prompt = `
あなたは人間の深層心理と運命を読み解く、鋭くも詩的なアナリスト（現代の神官）です。
対象者の深層意識が以下の6次元の数値（0-100）で算出されました。

生活基盤: ${vector6d[0]}
社会意識: ${vector6d[1]}
信頼構築: ${vector6d[2]}
対話力: ${vector6d[3]}
野心: ${vector6d[4]}
寛容性: ${vector6d[5]}

${answersText ? `診断スコア傾向:\n${answersText}` : ''}

【指示】
この数値を元に、無難な性格分析ではなく、相手の心を鋭く見透かすような「魂の取扱説明書（デジタルおみくじ）」を作成してください。
以下の3つの項目に分けて記述してください。

【御告げ（総評）】
対象者が無意識に隠している本性や、現在のエネルギー状態を見抜く、鋭く詩的な文章。

【待ち人（出会うべき人）】
対象者が「欲しいと思っている人」ではなく、この数値を補完するために「本当に衝突・知的摩擦を生むべき相手」の描写。

【学問・行動（今のあなたへ）】
大学生活や日常において、今のエネルギー状態を最大限に活かす（または守る）ための具体的なアクションや身を置くべき環境。

* 出力はプレーンテキストで行い、Markdownの記号（*や#）は一切使わないでください。
* 各項目の見出し（【御告げ】など）はそのままテキストとして含めてください。
* 人工知能っぽさや、一般的な性格診断のような解説は排除し、対象者個人に宛てた手紙や御告げのような、重みのあるトーンで記述してください。
`;

    const result = await model.generateContent(prompt);
    let fullReport = (await result.response.text()).replace(/[*#]/g, '').trim();

    if (!fullReport) {
      return NextResponse.json({ success: false, error: 'Report generation returned empty' }, { status: 500 });
    }

    // Update the DB with the generated synthesis
    await prisma.diagnosticResult.update({
      where: { id: resultId },
      data: { synthesis: fullReport }
    });

    return NextResponse.json({ success: true, synthesis: fullReport });

  } catch (error: any) {
    console.error('Report Generation Error:', error);
    // DEBUG: Return the error message directly to the frontend so we can see it
    const hasKey = !!process.env.GOOGLE_API_KEY;
    const errorMsg = error.message || String(error);
    return NextResponse.json({ success: true, synthesis: `エラー詳細: ${errorMsg} (Vercel API Key Exists: ${hasKey})` });
  }
}
