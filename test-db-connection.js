require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
let url = process.env.DATABASE_URL;
if (url) {
  url = url.replace(':6543', ':5432').replace('pgbouncer=true', '');
}
const prisma = new PrismaClient({ datasources: { db: { url } } });
async function main() {
  const users = await prisma.user.count();
  console.log('Connected! Users count:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
