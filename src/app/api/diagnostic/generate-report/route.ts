import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { model } from '@/lib/gemini';
import { cookies } from 'next/headers';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('zax-session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

    // Security check: Make sure user is not a guest anymore
    if (diagnosticResult.user.email.startsWith('guest_')) {
      return NextResponse.json({ success: false, error: 'Registration required to generate full report' }, { status: 403 });
    }

    const vector6d = JSON.parse(diagnosticResult.vector);

    const prompt = `
あなたは人間の深層心理と運命を読み解く、鋭くも詩的なアナリスト（現代の神官）です。
対象者の深層意識が以下の6次元の数値（0-100）で算出されました。

論理性: ${vector6d[0]}
直感力: ${vector6d[1]}
共感性: ${vector6d[2]}
意志力: ${vector6d[3]}
創造性: ${vector6d[4]}
柔軟性: ${vector6d[5]}

【指示】
この数値を元に、無難な性格分析ではなく、相手の心を鋭く見透かすような「魂の取扱説明書（デジタルおみくじ）」を作成してください。
以下の3つの項目に分けて記述してください。

【御告げ（総評）】
対象者が無意識に隠している本性や、現在のエネルギー状態を見抜く、鋭く詩的な文章。
（例：あなたは論理の盾で直感を隠そうとしていますが、本質的には激しいカオスの波を持っています。）

【待ち人（出会うべき人）】
対象者が「欲しいと思っている人」ではなく、この数値を補完するために「本当に衝突・共鳴すべき相手」の描写。
（例：あなたに必要なのは計画を褒める人ではなく、あなたの予定を突然破壊してくれる非常識な人間です。）

【学問・行動（今のあなたへ）】
大学生活や日常において、今のエネルギー状態を最大限に活かす（または守る）ための具体的なアクションや身を置くべき環境。
（例：大勢でのブレストはあなたのエネルギーを削ります。今は1対1の深い対話か、完全に孤独な環境が吉です。）

* 出力はプレーンテキストで行い、Markdownの記号（*や#）は一切使わないでください。
* 各項目の見出し（【御告げ】など）はそのままテキストとして含めてください。
* 人工知能っぽさや、一般的な性格診断のような解説は排除し、対象者個人に宛てた手紙や御告げのような、重みのあるトーンで記述してください。
`;

    const result = await model.generateContent(prompt);
    let fullReport = await result.response.text();
    fullReport = fullReport.replace(/[*#]/g, '').trim(); // Fallback sanitation

    // Update the DB with the long synthesis
    await prisma.diagnosticResult.update({
      where: { id: resultId },
      data: { synthesis: fullReport }
    });

    return NextResponse.json({ success: true, synthesis: fullReport });

  } catch (error: any) {
    console.error('Report Generation Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
