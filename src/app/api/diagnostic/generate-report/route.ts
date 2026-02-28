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
あなたはプロの深層心理アナリストです。
対象者の性格特性が以下の6次元の数値（0-100）で算出されました。

論理性: ${vector6d[0]}
直感力: ${vector6d[1]}
共感性: ${vector6d[2]}
意志力: ${vector6d[3]}
創造性: ${vector6d[4]}
柔軟性: ${vector6d[5]}

【指示】
この数値データを元に、対象者の深層心理、行動特性、コミュニケーションの傾向、潜在的な強みと課題、そして未来に向けたアドバイスを網羅した、非常に詳細なレポートを作成してください。
*   文字数は **約3000文字** 程度になるように、深堀りして記述してください。
*   出力はプレーンテキストで行い、段落分けを活用してください。
*   **絶対条件**: アスタリスク（*）やハッシュタグ（#）などのMarkdown記号は **一切使用しないでください**。
*   「AI」という単語は含めず、一人の人間（専門家）として語りかけるような、丁寧で温かみのあるトーン（日本語）で記述してください。
*   法的に問題になるような表現、極端な断定、医療的な診断などは避け、前向きな成長を促す内容にしてください。
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
