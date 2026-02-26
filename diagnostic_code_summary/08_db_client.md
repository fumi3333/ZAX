# DBクライアント - client.ts
パス: `src/lib/db/client.ts`

## 役割
- Prismaクライアントの初期化（pgbouncerパラメータ付与）
- vectorStoreオブジェクト: pgvectorを使ったベクトル保存・類似検索・マッチング候補検索

## コード
```typescript

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let connectionUrl: string | undefined = undefined;

if (process.env.DATABASE_URL) {
  try {
    // 謾ｹ陦梧枚蟄暦ｼ・n・峨ｄ遨ｺ逋ｽ縺祁ercel縺ｮ迺ｰ蠅・､画焚縺ｫ豺ｷ蜈･縺励※縺・ｋ繧ｱ繝ｼ繧ｹ繧帝亟縺舌◆繧√・繧ｯ繝ｬ繝ｳ繧ｸ繝ｳ繧ｰ
    let rawUrl = process.env.DATABASE_URL.replace(/\\n/g, '').replace(/\n/g, '').trim();
    
    // URL繧ｪ繝悶ず繧ｧ繧ｯ繝医ｒ菴ｿ縺｣縺ｦ螳牙・縺ｫ繧ｯ繧ｨ繝ｪ繝代Λ繝｡繝ｼ繧ｿ繧剃ｻ倅ｸ弱・荳頑嶌縺阪☆繧・    const url = new URL(rawUrl);
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    connectionUrl = url.toString();
  } catch (e) {
    console.error("Failed to parse DATABASE_URL", e);
    // 繝代・繧ｹ螟ｱ謨玲凾縺ｮ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ
    let rawUrl = process.env.DATABASE_URL.replace(/\\n/g, '').replace(/\n/g, '').trim();
    connectionUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`;
  }
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: connectionUrl ? { db: { url: connectionUrl } } : undefined,
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * 繝吶け繝医Ν讀懃ｴ｢縺ｨ菫晏ｭ倥・縺溘ａ縺ｮ繝倥Ν繝代・繧ｪ繝悶ず繧ｧ繧ｯ繝・ * PostgreSQL縺ｮpgvector諡｡蠑ｵ繧剃ｽｿ逕ｨ
 */
export const vectorStore = {
    /**
     * 繝吶け繝医Ν繧剃ｿ晏ｭ倥☆繧・     * @param userId 繝ｦ繝ｼ繧ｶ繝ｼID
     * @param embedding 蝓九ａ霎ｼ縺ｿ繝吶け繝医Ν (768谺｡蜈・- RAG逕ｨ)
     * @param statsVector 繧ｹ繝・・繧ｿ繧ｹ繝吶け繝医Ν (6谺｡蜈・- 蜿ｯ隕門喧逕ｨ) [Optional]
     * @param reasoning 繝吶け繝医Ν縺ｮ譬ｹ諡繝ｻ繧ｳ繝ｳ繝・く繧ｹ繝・     * @param resonanceScore 繝槭ャ繝√せ繧ｳ繧｢ (蜷・・繧ｯ繝医Ν縺ｮ驥阪∩莉倥￠)
     */
    async saveEmbedding(userId: string, embedding: number[], statsVector: number[] | null, reasoning: string, resonanceScore: number) {
        // pgvector蠖｢蠑上・譁・ｭ怜・縺ｫ螟画鋤 '[0.1, 0.2, ...]'
        const vectorString = `[${embedding.join(",")}]`;
        const statsString = statsVector ? JSON.stringify(statsVector) : null;
        
        // 1. EssenceVector繝・・繝悶Ν縺ｸ縺ｮ菫晏ｭ・(pgvector蝙・
        // vectorJson縺ｫ縺ｯembedding繧剃ｿ晏ｭ倥＠縺ｦ縺翫￥・医ヰ繝・け繧｢繝・・・・        // statsVector縺ｫ縺ｯ6谺｡蜈・せ繝・・繧ｿ繧ｹ繧谷SON縺ｨ縺励※菫晏ｭ・        await prisma.$executeRaw`
            INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "statsVector", "reasoning", "resonanceScore", "createdAt")
            VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${statsString}, ${reasoning}, ${resonanceScore}, NOW())
        `;
    },

    /**
     * 鬘樔ｼｼ繝吶け繝医Ν繧呈､懃ｴ｢縺吶ｋ
     * @param targetVector 讀懃ｴ｢蟇ｾ雎｡繝吶け繝医Ν (768谺｡蜈・
     * @param limit 蜿門ｾ嶺ｻｶ謨ｰ
     * @param userId (Optional) 迚ｹ螳壹Θ繝ｼ繧ｶ繝ｼ縺ｮ縺ｿ蟇ｾ雎｡縺ｫ縺吶ｋ蝣ｴ蜷・     * @returns 鬘樔ｼｼ蠎ｦ鬆・↓繧ｽ繝ｼ繝医＆繧後◆邨先棡
     */
    async searchSimilar(targetVector: number[], limit: number = 5, userId?: string) {
        const vectorString = `[${targetVector.join(",")}]`;
        
        // Cosine distance (<=>) 繧剃ｽｿ逕ｨ縺励※霍晞屬繧定ｨ育ｮ励＠縲∵・鬆・た繝ｼ繝・(霍晞屬縺瑚ｿ代＞・晞｡樔ｼｼ)
        if (userId) {
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev.reasoning, ev."resonanceScore", ev."createdAt", ev."statsVector",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                WHERE ev."userId" = ${userId}
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        } else {
             return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev.reasoning, ev."resonanceScore", ev."createdAt", ev."statsVector",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        }
    },

    /**
     * 繝槭ャ繝√Φ繧ｰ蛟呵｣懊ｒ讀懃ｴ｢縺吶ｋ (繝峨Γ繧､繝ｳ髯仙ｮ・
     * @param targetVector 讀懃ｴ｢蟇ｾ雎｡繝吶け繝医Ν
     * @param domainHash 繝峨Γ繧､繝ｳ繝上ャ繧ｷ繝･ (蠢・・
     * @param limit 蜿門ｾ嶺ｻｶ謨ｰ
     * @param excludeUserId 髯､螟悶☆繧九Θ繝ｼ繧ｶ繝ｼID (閾ｪ蛻・・霄ｫ)
     */
    async searchCandidates(targetVector: number[], domainHash: string, limit: number = 10, excludeUserId: string) {
        const vectorString = `[${targetVector.join(",")}]`;
        
        // Users繝・・繝悶Ν縺ｨJOIN縺励※domainHash縺ｧ繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ
        return await prisma.$queryRaw`
            SELECT u.id as "userId", u.nickname, u.affiliation, u."contactEmail", ev.reasoning, ev."statsVector",
                   (ev.vector <=> ${vectorString}::vector) as distance
            FROM "essence_vectors" ev
            JOIN "users" u ON ev."userId" = u.id
            WHERE u."domainHash" = ${domainHash}
            AND u.id != ${excludeUserId}
            ORDER BY distance ASC
            LIMIT ${limit}
        `;
    }
};

```
