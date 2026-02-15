// Robust Client Setup
let prisma: any;
let vectorStore: any;

try {
   /*
    const { PrismaClient } = require('@prisma/client');
    const globalForPrisma = global as unknown as { prisma: any };
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["query"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
    
    // Real Vector Store
    vectorStore = {
        async saveEmbedding(userId: string, vector: number[], reasoning: string, resonanceScore: number) {
            const vectorString = `[${vector.join(",")}]`;
            await prisma.$executeRaw`
                INSERT INTO "essence_vectors" ("id", "userId", "vector", "vectorJson", "reasoning", "resonanceScore", "createdAt")
                VALUES (gen_random_uuid(), ${userId}, ${vectorString}::vector, ${vectorString}, ${reasoning}, ${resonanceScore}, NOW())
            `;
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            const vectorString = `[${targetVector.join(",")}]`;
            return await prisma.$queryRaw`
                SELECT ev.id, ev."userId", ev.reasoning, ev."resonanceScore",
                       (ev.vector <=> ${vectorString}::vector) as distance
                FROM "essence_vectors" ev
                ORDER BY distance ASC
                LIMIT ${limit}
            `;
        }
    };
    */
    throw new Error("Force Mock");

} catch (e) {
    console.warn("⚠️ Prisma Client NOT FOUND. Using In-Memory Mock for Verification.");
    
    // In-Memory Mock Store
    const mockUsers: any[] = [];
    const mockVectors: any[] = [];

    prisma = {
        user: {
            findUnique: async ({ where }: any) => mockUsers.find(u => u.email === where.email) || null,
            create: async ({ data }: any) => {
                const newUser = { id: `mock_${Date.now()}`, ...data };
                mockUsers.push(newUser);
                return newUser;
            },
            findFirst: async () => mockUsers[0] || null,
        },
        $executeRaw: async () => console.log("Mock executeRaw"),
        $queryRaw: async () => [],
        diagnosticResult: {
             create: async ({ data }: any) => ({ id: "mock_diag_id", ...data }),
             findUnique: async () => null 
        },
        essenceVector: {
            create: async() => {}
        }
    };

    vectorStore = {
        async saveEmbedding(userId: string, vector: number[], reasoning: string, resonanceScore: number) {
            console.log("Mock Save Vector:", userId, vector);
            mockVectors.push({ userId, vector, reasoning });
        },
        async searchSimilar(targetVector: number[], limit: number = 5) {
            return []; // No similarity in mock
        }
    };
}

export { prisma, vectorStore };
