require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("Adding 'embedding' column to essence_vectors...");
  try {
    await prisma.$executeRaw`ALTER TABLE "essence_vectors" ADD COLUMN "embedding" vector(768);`;
    console.log("Successfully added embedding column.");
  } catch (e) {
    console.error("Error adding column (might already exist):", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
