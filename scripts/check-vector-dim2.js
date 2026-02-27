const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  const result = await prisma.$queryRaw`
    SELECT a.attname, t.typname, a.atttypmod 
    FROM pg_attribute a 
    JOIN pg_class c ON a.attrelid = c.oid 
    JOIN pg_type t ON a.atttypid = t.oid 
    WHERE c.relname = 'essence_vectors' AND a.attnum > 0;
  `;
  result.forEach(r => {
    console.log(`${r.attname} : ${r.typname} (${r.atttypmod})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
