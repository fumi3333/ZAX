import { NextResponse } from 'next/server';
import { prisma, vectorStore } from '@/lib/db/client';
import { model, embeddingModel } from '@/lib/gemini';
import { cookies } from 'next/headers';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { Database } from 'sqlite3';

export const maxDuration = 60; // タイムアウトを60秒に延長

export async function POST(req: Request) {
  try {
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

    // 2. Extract History from Brave
    const homedir = os.homedir();
    // Default Brave History path on Windows
    let historyPath = path.join(homedir, 'AppData', 'Local', 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default', 'History');
    
    // Check if it exists
    try {
        await fs.access(historyPath);
    } catch {
        // Fallback for demo or if Default doesn't have it, try Profile 1
        historyPath = path.join(homedir, 'AppData', 'Local', 'BraveSoftware', 'Brave-Browser', 'User Data', 'Profile 1', 'History');
        try {
            await fs.access(historyPath);
        } catch {
            return NextResponse.json({ success: false, error: 'Brave Browser History not found.' }, { status: 404 });
        }
    }

    // Copy to temp file to avoid locking issues
    const tempDbPath = path.join(os.tmpdir(), `brave_history_copy_${Date.now()}.sqlite`);
    await fs.copyFile(historyPath, tempDbPath);

    // Query SQLite asynchronously
    const getHistory = (): Promise<{title: string, url: string}[]> => {
        return new Promise((resolve, reject) => {
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(tempDbPath, sqlite3.OPEN_READONLY, (err: Error) => {
                if (err) return reject(err);
            });
            
            // Recent 50 YouTube videos (excluding generic pages)
            const query = `
                SELECT title, url 
                FROM urls 
                WHERE url LIKE '%youtube.com/watch%' 
                ORDER BY last_visit_time DESC 
                LIMIT 50
            `;
            
            db.all(query, [], (err: Error, rows: any) => {
                db.close();
                if (err) return reject(err);
                resolve(rows);
            });
        });
    };

    let historyRecords = [];
    try {
        historyRecords = await getHistory();
    } finally {
        // Clean up temp file
        try {
            await fs.unlink(tempDbPath);
        } catch (e) {
            console.error("Failed to delete temp db:", e);
        }
    }

    if (historyRecords.length === 0) {
        return NextResponse.json({ success: false, error: 'No YouTube history found in Brave.' }, { status: 400 });
    }

    // 3. Construct Analysis Prompt for Gemini (Fast Vector Calculation)
    const historyList = historyRecords.map((r, i) => `${i + 1}. ${r.title}`).join('\n');
    let profileText = `以下の最近視聴したYouTubeの動画タイトル一覧（直近50件）に基づき、この人物の深い心理・性格分析を行ってください。\n\n`;
    profileText += `## 視聴履歴\n${historyList}\n\n`;
    profileText += `
指示: 
この人物の強みや興味関心について、**50文字以内の非常に短い1文のみ**で要約を生成してください。（例: 「テクノロジーと効率化に関心が強く、論理的な思考を好む傾向があります。」）
出力に「AI」という語は含めないでください。

[重要: レポート本文（テキスト）を出力した後に、必ず以下の形式のJSONブロックを含めてください。]
\`\`\`json
{
  "vector": [論理性, 直感力, 共感性, 意志力, 創造性, 柔軟性]
}
\`\`\`
※各スコアは0から100の整数です。
    `;
    
    // 4. Call Gemini for Synthesis
    let synthesis = "履歴に基づき、あなたの性格特性ベクトルを算出しました。";
    let vector6d = [50, 50, 50, 50, 50, 50];

    try {
        const result = await model.generateContent(profileText);
        const responseText = await result.response.text();
        
        // Extract synthesis (text before JSON) and JSON
        const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.vector && Array.isArray(parsed.vector) && parsed.vector.length === 6) {
                    vector6d = parsed.vector;
                }
            } catch (e) {
                console.warn("JSON parse error from Gemini:", e);
            }
            synthesis = responseText.replace(jsonMatch[0], '').trim();
        } else {
            synthesis = responseText.trim();
        }
    } catch (e) {
        console.warn("Gemini API Error (Synthesis):", e);
    }

    // 4.5. 768次元ベクトル (セマンティック検索用)
    let embedding768: number[] | undefined = undefined;
    try {
        const embedText = `Synthesis: ${synthesis}\nTop History: ${historyRecords.slice(0, 10).map(h => h.title).join(', ')}`;
        const embeddingResult = await embeddingModel.embedContent(embedText);
        embedding768 = embeddingResult.embedding.values.slice(0, 768);
    } catch (e) {
        console.warn("Gemini API Error (Embedding):", e);
    }

    // 5. Save to Database
    // We will save fake "answers" to satisfy the existing frontend, or we can adjust frontend.
    // Let's save a fake answers object.
    const fakeAnswers = {};
    const diagnosticResult = await prisma.diagnosticResult.create({
      data: {
        userId: userId,
        answers: JSON.stringify(fakeAnswers),
        synthesis: synthesis,
        vector: JSON.stringify(vector6d),
      },
    });

    await vectorStore.saveEmbedding(
        userId,
        vector6d,
        "ブラウザ履歴（YouTube視聴内容）に基づく深層分析",
        1.0,
        embedding768
    );

    return NextResponse.json({ 
        success: true, 
        id: diagnosticResult.id,
        synthesis: synthesis,
        answers: fakeAnswers,
    });

  } catch (error: any) {
    console.error('History Analysis Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
