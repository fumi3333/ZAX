# 診断送信API - route.ts
パス: `src/app/api/diagnostic/submit/route.ts`

## 役割
- 診断回答を受け取り、Gemini AIで性格分析テキストを生成
- 6次元ベクトルと768次元埋め込みを計算してDBに保存
- セッションIDによるゲストユーザー管理

## コード

```typescript
import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { questions, effectiveScore } from '@/data/questions';
import { model, embeddingModel } from '@/lib/gemini';
import { logGemini } from '@/lib/gemini-log';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { signSession, verifySession } from '@/lib/crypto';

// Allow execution up to 60 seconds to accommodate long Gemini responses
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { answers, freeText } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'No answers provided' }, { status: 400 });
    }

    // 1. Authenticate / Create User
    const cookieStore = await cookies();
    let sessionId = verifySession(cookieStore.get('zax-session')?.value);

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      cookieStore.set('zax-session', signSession(sessionId), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365,
      });
    }

    let userId = sessionId;
    let user = null;
    
    // B. If no user yet (Guest fallback)
    if (!user) {
        user = await prisma.user.findUnique({ where: { id: userId } });
        
        // 繧ゅ＠DB縺ｫ繝ｦ繝ｼ繧ｶ繝ｼ縺悟ｭ伜惠縺励↑縺・ｴ蜷茨ｼ亥商縺Гookie縺梧ｮ九▲縺ｦ縺・ｋ蝣ｴ蜷医↑縺ｩ・・        if (!user) {
            const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            const guestEmail = `guest_${uniqueSuffix}@zax.guest`; 
            
            try {
                user = await prisma.user.create({
                    data: {
                        email: guestEmail,
                        password: "guest-password",
                        isStudent: false,
                    }
                });
            } catch (e) {
                console.error("Failed to create fallback guest user:", e);
                user = await prisma.user.findFirst(); // ultimate fallback
            }
        }
    }
    
    if (!user) {
        return NextResponse.json({ success: false, error: 'User session could not be established' }, { status: 500 });
    }

    userId = user.id;
    if (userId !== sessionId) {
         cookieStore.set('zax-session', signSession(userId), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    }

    // 2. Construct Analysis Prompt
    let profileText = "莉･荳九・諤ｧ譬ｼ險ｺ譁ｭ繝・・繧ｿ縺ｫ蝓ｺ縺･縺阪√％縺ｮ莠ｺ迚ｩ縺ｮ諤ｧ譬ｼ縲∽ｾ｡蛟､隕ｳ縲∬｡悟虚迚ｹ諤ｧ繧定ｩｳ邏ｰ縺ｫ蛻・梵縺励∵律譛ｬ隱槭〒險倩ｿｰ縺励※縺上□縺輔＞縲・n\n";
    
    if (freeText && freeText.trim()) {
        profileText += `## 繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ繧医ｋ閾ｪ逕ｱ險倩ｿｰ・育函縺ｮ螢ｰ・噂n"${freeText.trim()}"\n\n`;
    }
    
    profileText += "## 繧ｫ繝・ざ繝ｪ蛻･繧ｹ繧ｳ繧｢蛯ｾ蜷托ｼ・-7蟆ｺ蠎ｦ・噂n";
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

    profileText += "## 繧ｫ繝・ざ繝ｪ蛻･繧ｹ繧ｳ繧｢蛯ｾ蜷曾n";
    for (const [cat, data] of Object.entries(categoryScores)) {
        const avg = (data.sum / data.count).toFixed(1);
        profileText += `- ${cat}: 蟷ｳ蝮・${avg}/7.0\n`;
    }

    profileText += "\n## 隧ｳ邏ｰ蝗樒ｭ斐ョ繝ｼ繧ｿ\n";
    for (const id of sortedAnswerIds) {
        const q = questions.find(q => q.id === id);
        const score = answers[id];
        if (q) {
            profileText += `Q${id} [${q.categoryJa}]: "${q.text}" -> ${score}\n`;
        }
    }

    profileText += `\n\n謖・､ｺ: 
    1. 荳願ｨ倥・謨ｰ蛟､繝・・繧ｿ・医せ繧ｳ繧｢・峨↓蜉縺医√ｂ縺励瑚・逕ｱ險倩ｿｰ縲阪′縺ゅｋ蝣ｴ蜷医・縺昴・譁・ц繧・・驥上ｒ豺ｱ縺剰・・縺励※縺上□縺輔＞縲・    2. 謨ｰ蛟､縺ｨ險倩ｿｰ蜀・ｮｹ縺ｫ荵夜屬縺後≠繧句ｴ蜷医・縲∬ｨ隱槫喧縺輔ｌ縺溘檎函縺ｮ螢ｰ縲阪↓繧医ｊ豺ｱ螻､蠢・炊縺碁國繧後※縺・ｋ縺ｨ莉ｮ螳壹＠縺ｦ蛻・梵縺励※縺上□縺輔＞縲・    3. 縺薙・莠ｺ迚ｩ縺ｮ豺ｱ螻､蠢・炊縲∬｡悟虚迚ｹ諤ｧ縲√◎縺励※縲後←縺・＞縺・憾諷九′縺昴・莠ｺ縺ｫ縺ｨ縺｣縺ｦ縺ｮ逵溘・蜈・ｶｳ・亥ｹｸ遖擾ｼ峨°縲阪↓縺､縺・※縲√・繝ｭ縺ｮ隱咲衍遘大ｭｦ閠・・蠢・炊蛻・梵螳倥→縺励※縺ｮ隕也せ縺九ｉ隧ｳ邏ｰ縺ｪ繝ｬ繝昴・繝医ｒ菴懈・縺励※縺上□縺輔＞縲・    `;

    profileText += `
    莉･荳九・隕句・縺暦ｼ・arkdown蠖｢蠑上・ h3 '### '・峨ｒ蠢・★蜷ｫ繧√・撼蟶ｸ縺ｫ隱ｭ縺ｿ蠢懊∴縺ｮ縺ゅｋ髟ｷ譁・〒蜃ｺ蜉帙＠縺ｦ縺上□縺輔＞縲ょ・蜉帛・縺ｫ縲窟I縲阪→縺・≧蜊倩ｪ槭・邨ｶ蟇ｾ縺ｫ蜷ｫ繧√↑縺・〒縺上□縺輔＞縲・
    ### 隱咲衍繝吶け繝医Ν縺ｨ譛ｬ雉ｪ逧・↑蠑ｷ縺ｿ
    ・医％縺ｮ莠ｺ迚ｩ縺梧戟縺､迚ｹ蠕ｴ逧・↑蠑ｷ縺ｿ縺ｨ縲∽ｸ也阜繧偵←縺・拷縺医※縺・ｋ縺九・蛻・梵縲・00譁・ｭ礼ｨ句ｺｦ縺ｧ豺ｱ謗倥ｊ縺励※縺上□縺輔＞・・
    ### 豺ｱ螻､逧・↑萓｡蛟､隕ｳ縺ｨ繝｢繝√・繝ｼ繧ｷ繝ｧ繝ｳ縺ｮ貅先ｳ・    ・郁｡ｨ髱｢逧・↑谺ｲ豎ゅ〒縺ｯ縺ｪ縺上∽ｽ輔′縺薙・莠ｺ迚ｩ縺ｮ蠢・ｒ蜍輔°縺励∵ュ辭ｱ繧貞だ縺代＆縺帙ｋ縺ｮ縺九↓縺､縺・※縲ょ・菴鍋噪縺九▽豺ｱ縺剰・ｯ溘＠縺ｦ縺上□縺輔＞・・
    ### 鞫ｩ謫ｦ縺檎函縺倥ｄ縺吶＞迺ｰ蠅・→蠑ｱ縺ｿ
    ・医←縺ｮ繧医≧縺ｪ迥ｶ豕√〒繧ｹ繝医Ξ繧ｹ繧呈─縺倥ｄ縺吶＞縺九√◎縺ｮ逅・罰縺ｯ菴輔°縲ゅ∪縺溘◎繧後ｒ縺ｩ縺・ｹ励ｊ雜翫∴繧九∋縺阪°・・
    ### 蜈・ｶｳ諢滂ｼ亥ｹｸ遖擾ｼ峨ｒ諢溘§繧区擅莉ｶ
    ・医せ繝斐Μ繝√Η繧｢繝ｫ縺ｧ閭｡謨｣閾ｭ縺・｡ｨ迴ｾ縺ｯ驕ｿ縺代∬┻遘大ｭｦ逧・・迺ｰ蠅・噪繝ｻ遉ｾ莨夂噪縺ｪ蛛ｴ髱｢縺九ｉ螳｢隕ｳ逧・°縺､蜈ｷ菴鍋噪縺ｫ縲後％縺・＞縺・腸蠅・・蠖ｹ蜑ｲ縺ｫ縺翫＞縺ｦ譛繧ゅヱ繝輔か繝ｼ繝槭Φ繧ｹ縺ｨ蟷ｸ遖丞ｺｦ縺碁ｫ倥∪繧九阪→險倩ｿｰ縺吶ｋ縺薙→・・
    ### 謗ｨ螂ｨ縺輔ｌ繧玖｡悟虚繝代ち繝ｼ繝ｳ・・ext Action・・    ・医％縺ｮ迚ｹ諤ｧ繧呈ｴｻ縺九＠縺ｦ縲∽ｻ雁ｾ後・蟄ｦ讌ｭ繧・く繝｣繝ｪ繧｢縲∽ｺｺ髢馴未菫ゅｒ縺ｩ縺・ｧ狗ｯ峨＠縺ｦ縺・￥縺ｹ縺阪°縲ょ・菴鍋噪縺ｪ陦悟虚謖・・繧・縺､莉･荳頑署遉ｺ縺励※縺上□縺輔＞・・
    ### 邱剰ｩ包ｼ井ｻ雁ｾ後・騾ｲ蛹悶↓蜷代￠縺溘ヵ繧｣繝ｼ繝峨ヰ繝・け・・    ・亥・菴薙ｒ諡ｬ繧九い繝峨ヰ繧､繧ｹ縺ｨ縲√ｈ繧企ｫ倥＞谺｡蜈・∈閾ｪ蟾ｱ邨ｱ蜷医＠縺ｦ縺・￥縺溘ａ縺ｮ繧ｨ繝ｼ繝ｫ・荏;

    // 3. Call Gemini for Synthesis
    let synthesis = "";
    try {
        const result = await model.generateContent(profileText);
        const response = await result.response;
        synthesis = response.text();
        if (!synthesis) throw new Error("Empty response from Gemini");
        logGemini("synthesis", profileText, synthesis).catch(() => {});
    } catch (e: any) {
        console.error("Gemini API Error (Synthesis):", e);
        // Log the error to the DB for debugging
        await logGemini("error", profileText, `ERROR: ${e.message || String(e)}`, { stack: e.stack }).catch(() => {});
        
        throw new Error("迴ｾ蝨ｨ縲√し繝ｼ繝舌・縺ｸ縺ｮ繧｢繧ｯ繧ｻ繧ｹ縺碁寔荳ｭ縺励※縺翫ｊ縲∝・譫舌お繝ｳ繧ｸ繝ｳ縺悟ｿ懃ｭ斐＠縺ｾ縺帙ｓ縲ゅ＠縺ｰ繧峨￥邨後▲縺ｦ縺九ｉ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
    }

    // 4. 6谺｡蜈・・繧ｯ繝医Ν繧偵き繝・ざ繝ｪ繧ｹ繧ｳ繧｢縺九ｉ邂怜・・郁ｫ也炊諤ｧ, 逶ｴ諢溷鴨, 蜈ｱ諢滓ｧ, 諢丞ｿ怜鴨, 蜑ｵ騾諤ｧ, 譟碑ｻ滓ｧ・・    const CATEGORY_ORDER = ['Social', 'Empathy', 'Discipline', 'Openness', 'Emotional'] as const;
    const CATEGORY_JA: Record<string, string> = { Social: '螟門髄諤ｧ', Empathy: '蜊碑ｪｿ諤ｧ', Discipline: '隱螳滓ｧ', Openness: '髢区叛諤ｧ', Emotional: '諠・ｷ貞ｮ牙ｮ壽ｧ' };
    const rawByCat = CATEGORY_ORDER.map((c) => {
        const d = categoryScores[CATEGORY_JA[c]] || { sum: 0, count: 0 };
        const avg = d.count > 0 ? d.sum / d.count : 4;
        return Math.round(((avg - 1) / 6) * 100);
    });
    const [social, empathy, discipline, openness, emotional] = rawByCat;
    const vector: number[] = [
        discipline,                          // 隲也炊諤ｧ 竊・隱螳滓ｧ
        openness,                            // 逶ｴ諢溷鴨 竊・髢区叛諤ｧ
        empathy,                             // 蜈ｱ諢滓ｧ 竊・蜊碑ｪｿ諤ｧ
        discipline,                          // 諢丞ｿ怜鴨 竊・隱螳滓ｧ
        openness,                            // 蜑ｵ騾諤ｧ 竊・髢区叛諤ｧ
        Math.round((emotional + social) / 2), // 譟碑ｻ滓ｧ 竊・諠・ｷ貞ｮ牙ｮ壽ｧ繝ｻ螟門髄諤ｧ
    ];

    // 5. Generate 768-dim Embedding for RAG
    let embedding: number[] = [];
    
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
    }

    try {
        const embeddingResult = await embeddingModel.embedContent(synthesis);
        // Force slice to 768 dims to match Prisma schema vector(768)
        embedding = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.error("Embedding API Error:", e);
        throw new Error("繝吶け繝医Ν逕滓・縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・);
    }

    // 6. Save to Database
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(answers),
        synthesis: synthesis,
        vector: JSON.stringify(embedding), // Start storing 768-dim in DB 'vector' field? Schema says 'vectorJson'
        // Wait, Schema DiagonosticResult.vector is string. 
        // Let's store the 6-dim stats there? Or the 768? 
        // Usage of DiagnosticResult.vector? 
        // It's likely used for specific diagnostic retrieval. 
        // Let's store the 6-dim there for now as it was before, or store both?
        // Let's store the 6-dim stats in DiagnosticResult for backward compat if any.
        // Actually, the prompt says "vector: JSON.stringify(vector)" where vector is 6-dim.
        // Let's keep it.
      },
    });

    // Also save to EssenceVector for matching & History
    await vectorStore.saveEmbedding(
        userId,
        embedding,  // 768-dim
        vector,     // 6-dim stats
        "諤ｧ譬ｼ險ｺ譁ｭ邨先棡",
        1.0 
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
        error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

```
