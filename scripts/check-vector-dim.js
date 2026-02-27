const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  // pgvectorの次元数を確認（既存のデータから次元を推測するか、システムカタログを使用）
  const result = await prisma.$queryRaw`
    SELECT a.attname, t.typname, a.atttypmod 
    FROM pg_attribute a 
    JOIN pg_class c ON a.attrelid = c.oid 
    JOIN pg_type t ON a.atttypid = t.oid 
    WHERE c.relname = 'essence_vectors' AND a.attnum > 0;
  `;
  console.log(JSON.stringify(result, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
