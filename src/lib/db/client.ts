// REAL PRISMA FOR PRODUCTION (DISABLED DUE TO ENV ERROR)
// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma = globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// MOCK PRISMA (For Design/UI Work without DB)
const mockPrisma = {
    user: {
        findUnique: async () => null,
        create: async (data: any) => ({ ...data, id: "mock-user-id" }),
    },
    essenceVector: {
        create: async () => {},
        findMany: async () => [],
    },
    feedback: {
        create: async () => {},
    }
};

export const prisma = mockPrisma as any;

// --- Vector Logic (MVP: In-Memory / JSON) ---

// Helper: Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const modA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const modB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return modA && modB ? dotProduct / (modA * modB) : 0;
}

export const vectorStore = {
    // Save a new vector (e.g. Analysis Result)
    async saveEmbedding(userId: string, data: { vector: number[], reasoning?: string, resonance_score?: number }, type: 'personality' | 'interest' | 'feedback') {
        try {
            // Ensure user exists (create generic guest if needed)
            // For MVP, if userId is new, we might fail or auto-create.
            // Let's assume userId is managed or we upsert.
           
            /*
            // TODO: Enable this when logic is ready
            await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId, email: `guest_${userId.substring(0,8)}` } // fallback
            });
            */

            await prisma.essenceVector.create({
                data: {
                    userId: userId,
                    vector: JSON.stringify(data.vector),
                    reasoning: data.reasoning || "Stored via Logic Engine",
                    resonanceScore: data.resonance_score || 0, 
                }
            });
            
            console.log(`[DB] Saved vector for ${userId}`);
        } catch (e) {
            console.error("[DB] Failed to save embedding", e);
        }
    },

    // Search similar vectors (Brute Force in JS - OK for <10k rows)
    async searchSimilar(targetVector: number[], limit: number = 5) {
        try {
            // Fetch all latest vectors (inefficient at scale, fine for prototype)
            // Ideally: Fetch only valid/recent ones
            /*
            const allVectors = await prisma.essenceVector.findMany({
                take: 100, // Limit scan size for safety
                orderBy: { createdAt: 'desc' },
                include: { user: true }
            });

            const candidates = allVectors.map((record: { userId: string; vector: string; reasoning: string }) => {
                const vec = JSON.parse(record.vector) as number[];
                return {
                    id: record.userId,
                    resonance: cosineSimilarity(targetVector, vec), 
                    explanation: record.reasoning
                };
            });

            // Sort by resonance DESC
            return candidates
                .sort((a: { resonance: number }, b: { resonance: number }) => b.resonance - a.resonance)
                .slice(0, limit);
            */
            console.log("[DB] Search similar (MOCKED)");
            return []; // Return empty for now to prevent crashes

        } catch (e) {
            console.error("[DB] Search failed", e);
            return [];
        }
    }
};

