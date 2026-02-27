const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("Applying ALTER TABLE to change vector type to vector(6)...");
  
  // 過去の768次元だったvectorカラムを6次元に縮小（既存データは [0,0,0,0,0,0] に初期化する安全策）
  await prisma.$executeRaw`
    ALTER TABLE "essence_vectors" 
    ALTER COLUMN "vector" TYPE vector(6) 
    USING (
      CASE 
        WHEN array_length(vector::real[], 1) = 6 THEN vector::vector(6)
        ELSE array[0,0,0,0,0,0]::vector(6)
      END
    );
  `;
  
  console.log("Successfully altered vector to vector(6).");
}

main().catch(console.error).finally(() => prisma.$disconnect());
