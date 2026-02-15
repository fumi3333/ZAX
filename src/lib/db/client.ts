// ZAX Database Client — Prisma + pgvector
// Docker (ankane/pgvector) 起動中は実DB接続、未起動時はモックにフォールバック

let prisma: any;
let vectorStore: any;

// DATABASE_URL が無い場合はモックのみ使用（Vercel等で未設定時）
const useRealDb = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("localhost:5432/dummy")
);

if (!useRealDb) {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "postgresql://localhost:5432/dummy";
    }
}

try {
    if (!useRealDb) throw new Error("Using mock DB");
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

    // Expected dimension for essence_vectors (vector(6) in DB). 768-dim embeddings are NOT stored here.
    const EXPECTED_VECTOR_DIM = 6;

    // Real Vector Store (pgvector)
    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number
        ) {
            if (!Array.isArray(vector) || vector.length !== EXPECTED_VECTOR_DIM) {
                throw new Error(
                    `Vector dimension mismatch: expected ${EXPECTED_VECTOR_DIM}, got ${vector?.length ?? "non-array"}. ` +
                    "EssenceVector stores 6-dim display vectors only. 768-dim embeddings are not persisted here."
                );
            }
            const safeValues = vector.map((v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) throw new Error("Vector contains non-finite value");
                return Math.max(0, Math.min(100, n));
            });
            const vectorString = `[${safeValues.join(",")}]`;
            await prisma.$executeRaw`
                INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
            `;
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            if (!Array.isArray(targetVector) || targetVector.length !== EXPECTED_VECTOR_DIM) {
                throw new Error(
                    `Target vector dimension mismatch: expected ${EXPECTED_VECTOR_DIM}, got ${targetVector?.length ?? "non-array"}`
                );
            }
            const safeValues = targetVector.map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 50;
            });
            const vectorString = `[${safeValues.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev."vectorJson", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        },
    };

    // DB接続テスト (非同期 — 失敗時はログのみ)
    prisma
        .$queryRaw`SELECT 1`
        .then(() => console.log("✅ PostgreSQL + pgvector 接続成功"))
        .catch((err: any) => console.warn("⚠️ DB接続失敗 (モックにフォールバックはしません):", err.message));
} catch (e: any) {
    console.warn(
        "⚠️ Prisma Client が見つかりません。インメモリ・モックを使用します。",
        e.message
    );

    // In-Memory Mock Store (Prisma未生成時 or ビルド時のフォールバック)
    const mockUsers: any[] = [];
    const mockVectors: any[] = [];
    const mockDiagnostics: any[] = [];

    prisma = {
        user: {
            findUnique: async ({ where }: any) =>
                mockUsers.find(
                    (u) => u.email === where.email || u.id === where.id
                ) || null,
            create: async ({ data }: any) => {
                const newUser = { id: `mock_${Date.now()}`, ...data };
                mockUsers.push(newUser);
                return newUser;
            },
            findFirst: async () => mockUsers[0] || null,
        },
        diagnosticResult: {
            create: async ({ data }: any) => {
                const result = {
                    id: `mock_diag_${Date.now()}`,
                    ...data,
                    createdAt: new Date(),
                };
                mockDiagnostics.push(result);
                return result;
            },
            findUnique: async ({ where }: any) =>
                mockDiagnostics.find((d) => d.id === where.id) || null,
        },
        essenceVector: {
            create: async () => {},
        },
        $executeRaw: async (...args: any[]) =>
            console.log("Mock $executeRaw"),
        $queryRaw: async () => [],
    };

    vectorStore = {
        async saveEmbedding(
            userId: string,
            vector: number[],
            reasoning: string,
            resonanceScore: number
        ) {
            console.log("Mock saveEmbedding:", userId, `[${vector.length}dim]`);
            mockVectors.push({ userId, vector, reasoning, resonanceScore });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            // モックでも最低限のコサイン類似度検索を実行
            if (mockVectors.length === 0) return [];

            const dot = (a: number[], b: number[]) =>
                a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
            const mag = (a: number[]) =>
                Math.sqrt(a.reduce((s, v) => s + v * v, 0));
            const cosine = (a: number[], b: number[]) => {
                const ma = mag(a);
                const mb = mag(b);
                return ma && mb ? dot(a, b) / (ma * mb) : 0;
            };

            return mockVectors
                .map((mv) => ({
                    id: `mock_vec_${mv.userId}`,
                    userId: mv.userId,
                    vectorJson: JSON.stringify(mv.vector),
                    reasoning: mv.reasoning,
                    resonanceScore: mv.resonanceScore,
                    distance: 1 - cosine(targetVector, mv.vector),
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);
        },
    };
}

export { prisma, vectorStore };
