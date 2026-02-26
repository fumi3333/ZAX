const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Adding HNSW index to essence_vectors...");
    try {
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "essence_vectors_vector_hnsw_idx" 
            ON "essence_vectors" USING hnsw (vector vector_cosine_ops);
        `);
        console.log("✅ HNSW Index added successfully.");
    } catch (e) {
        console.error("❌ Failed to add index:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
