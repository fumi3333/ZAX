import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions, effectiveScore } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini';
import { cookies, headers } from 'next/headers';
import { signSession, verifySession } from '@/lib/crypto';
import { createGuestUser } from '@/lib/db/user-factory';

export const maxDuration = 60;

// IPアドレスごとのゲスト作成回数を一時管理（1時間ウィンドウ）
const guestCreationLog = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;     // 1IPあたりの最大リクエスト数
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1時間（ミリ秒）

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = guestCreationLog.get(ip);
  if (!record || now > record.resetAt) {
    guestCreationLog.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true; // OK
  }
  if (record.count >= RATE_LIMIT_MAX) return false; // NG: 制限超過
  record.count++;
  return true; // OK
}

export async function POST(req: Request) {
  try {
    const { answers, freetext, email: submittedEmail } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate User (or create guest session)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('zax-session')?.value;
    let sessionId = verifySession(sessionCookie);

    if (!sessionId) {
      // IPレート制限チェック（ゲスト作成の無限生成を防ぐ）
      const headerList = await headers();
      const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      if (!checkRateLimit(ip)) {
        return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
      }

      const newId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionId = newId;
      const signedSession = signSession(newId);
      
      cookieStore.set('zax-session', signedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      // user-factory 経由でゲストユーザーを作成（ハードコードパスワード・フォールバックなし）
      user = await createGuestUser(sessionId);
    }
    if (user) userId = user.id;

    // 2a. メールアドレスが提供されていたらユーザーに紐付けて保存
    if (submittedEmail && submittedEmail.includes('@') && user) {
      try {
        const { hashEmail } = await import('@/lib/crypto');
        const hashedEmail = hashEmail(submittedEmail);
        // 既に別のユーザーが使っていなければ更新
        const emailExists = await prisma.user.findUnique({ where: { email: hashedEmail } });
        if (!emailExists) {
          await prisma.user.update({
            where: { id: user.id },
            data: { email: hashedEmail }
          });
        } else if (emailExists.id !== user.id) {
          // 既存ユーザーがいれば、そちらのIDを使う（診断結果をそちらに紐付け）
          userId = emailExists.id;
        }
      } catch (e) {
        console.warn('Email save error (non-fatal):', e);
      }
    }

    // 2b. Calculate 6D Vector and Category Scores
    const sortedAnswerIds = Object.keys(answers).map(Number).sort((a,b) => a-b);
    const categoryScores: Record<string, {sum: number, count: number}> = {};
    
    for (const id of sortedAnswerIds) {
      const q = questions.find(q => q.id === id);
      if (q) {
        const score = effectiveScore(q, answers[id]);
        if (!categoryScores[q.categoryJa]) {
            categoryScores[q.categoryJa] = { sum: 0, count: 0 };
        }
        categoryScores[q.categoryJa].sum += score;
        categoryScores[q.categoryJa].count += 1;
      }
    }

    // 6次元ベクトル (レーダーチャート用)
    const categoryOrder = ['Lifestyle', 'Values', 'Trust', 'Conflict', 'Ambition', 'Tolerance'] as const;
    const jaMap: Record<string, string> = { 
      'Lifestyle': 'ライフスタイル', 
      'Values': '価値観・社会', 
      'Trust': '信頼・協働', 
      'Conflict': 'コンフリクト解決', 
      'Ambition': '野心・キャリア',
      'Tolerance': '寛容性・多様性'
    };
    const rawByCat = categoryOrder.map(c => {
        const d = categoryScores[jaMap[c]];
        const avg = d && d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [lifestyle, values, trust, conflict, ambition, tolerance] = rawByCat;
    const vector6d = [lifestyle, values, trust, conflict, ambition, tolerance];

    // 3. Construct prompt for Structured JSON Omikuji
    const prompt = `
あなたは人間の深層心理と運命を読み解く、優しくも鋭く、詩的なアナリスト（現代の神官）です。
対象者（あなた）の深層意識が以下の6次元の数値（0-100）で算出されました。

生活基盤: ${vector6d[0]}
社会意識: ${vector6d[1]}
信頼構築: ${vector6d[2]}
対話力: ${vector6d[3]}
野心: ${vector6d[4]}
寛容性: ${vector6d[5]}

${freetext ? `自由記述（本人の本音や生の声）:\n"${freetext}"` : ''}

【指示】
この数値と自由記述を元に、無難な性格分析ではなく、相手の心を鋭く見透かすような「デジタルおみくじ結果」を作成してください。
以下の3つのセクションを、正確にJSONフォーマットで出力してください。

■ 重要言語ルール:
- 必ず、画面を見ている「あなた」に対して直接、対話するように優しく語りかける「二人称（あなた、もしくは主語なし）」で執筆してください。
- 「この方は」「この人物」「回答者」「本人」「〜タイプです」「〜言えます」といった、第三者を心理分析して誰かに報告するような「冷たい客観的な表現」は絶対に禁止します。
- 例えば、「この方は〜と言えます」ではなく、「あなたは〜なのです」「〜という性質を持っています」「〜でしょう」と言い換えてください。

セクション1「otsuge」（おみくじ結果）:
あなたが無意識に隠している本性、繊細な願い、あるいは現在の精神エネルギー状態を見抜く、優しく鋭い詩的な文章。150〜200文字。
※「この方は」などの三人称は厳禁。直接「あなた」へ語りかけてください。

セクション2「machihito」（相性の良い相手）:
あなたが欲しいと思っている都合の良い相手ではなく、あなたの価値観を補完し、お互いに深い成長・知的摩擦を生み出せる「本当に引き合うべき・衝突すべき相手」の特徴や雰囲気の直接的な描写。100〜150文字。
※自分の自己紹介や特徴の羅列は絶対に禁止します。あくまで「相性の良い、出会うべき相手の描写」のみを書いてください。

セクション3「koudou」（今後のアプローチ・今のあなたへ）:
大学生活や日常において、あなたが今一歩踏み出すべき具体的なアクションや、身を置くべき環境、意識すべき心構えへの具体的な提案。100〜150文字。
※自分の特徴の羅列は絶対に禁止します。具体的なアクション提案（〜をしてみると良いでしょう、〜に身を置いてみてください、など）を書いてください。

出力ルール:
- 必ずJSONのみを出力してください。余計な説明文や前置き、コードブロックは一切不要。
- アスタリスク(*)、シャープ(#)、括弧(「」()（）[])、コロン(:：)、HTMLタグは一切含めないでください。
- 人工知能っぽさや、一般的な性格診断の解説文のような単調な説明は排除し、対象者個人に宛てたメッセージのような重みと優しさのあるトーンで。

出力形式（このフォーマット厳守）:
{"otsuge": "おみくじのテキスト", "machihito": "相性の良い相手のテキスト", "koudou": "行動のテキスト"}
`;

    // 4. Call Gemini for Synthesis
    let synthesis = "";
    try {
        const result = await model.generateContent(prompt);
        let rawText = (await result.response.text()).trim();

        // Strip ALL markdown and formatting symbols aggressively
        rawText = rawText
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/#{1,6}\s/g, '')
          .replace(/#/g, '')
          .replace(/_{1,2}/g, '')
          .trim();

        // Try to parse as structured JSON
        try {
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.otsuge && parsed.machihito && parsed.koudou) {
            const cleanPattern = /[*#\[\]【】()（）:：]/g;
            synthesis = JSON.stringify({
              otsuge: parsed.otsuge.replace(cleanPattern, ' ').replace(/\s+/g, ' ').trim(),
              machihito: parsed.machihito.replace(cleanPattern, ' ').replace(/\s+/g, ' ').trim(),
              koudou: parsed.koudou.replace(cleanPattern, ' ').replace(/\s+/g, ' ').trim(),
            });
          }
        } catch { /* parse fallback */ }

        if (!synthesis) {
          // Fallback parsing or string assembly
          const cleanPattern = /[*#\[\]【】()（）:：]/g;
          const cleanText = rawText.replace(cleanPattern, ' ').replace(/\s+/g, ' ').trim();
          synthesis = JSON.stringify({
            otsuge: cleanText.substring(0, 180),
            machihito: "あなたの内なる声を理解し、対等に議論を交わし合える、知的好奇心の強い人物があなたの引き合う相手です。",
            koudou: "今のペースを守りつつ、心地よく感じられる静かな環境へ少しだけ踏み出してみましょう。"
          });
        }
    } catch (e) {
        console.warn("Gemini API Error (Synthesis):", e);
        synthesis = JSON.stringify({
          otsuge: "あなたの直感と意志は、周囲の期待を超えて独自の道を切り拓く力に満ちています。",
          machihito: "あなたの内なる声を理解し、対等に議論を交わし合える、知的好奇心の強い人物があなたの引き合う相手です。",
          koudou: "今のペースを守りつつ、心地よく感じられる静かな環境へ少しだけ踏み出してみましょう。"
        });
    }

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
        freetext: freetext || null,
      },
    });

    // 5b. 質問別回答を保存（分析用）
    try {
      const answerRows = sortedAnswerIds
        .map(id => {
          const q = questions.find(q => q.id === id);
          if (!q) return null;
          return {
            id: `${diagnosticResult.id}_q${id}`,
            resultId: diagnosticResult.id,
            questionId: id,
            score: answers[id],
            category: q.category,
          };
        })
        .filter(Boolean);

      if (answerRows.length > 0) {
        await prisma.diagnosticAnswer.createMany({ data: answerRows as any[] });
      }
    } catch (e) {
      console.warn('DiagnosticAnswer save error (non-fatal):', e);
    }

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
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
